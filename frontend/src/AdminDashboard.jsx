import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase'; // Import Firebase Auth
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth'; // Added updateProfile, signOut
import './AdminDashboard.css';
import acmLogo from './assets/acm_logo.png';

// Import your games here
import MonkeyType from './games/MonkeyType/App';
import WordleClone from './games/Wordle';
import Pacman from './games/Pacman/App';
import MemeDecoder from './games/MemeDecoder/App';
import Emoji from './games/Emoji/Emoji';

const GAMES = [
  { id: 'monkeytype', name: 'MonkeyType', icon: '⌨️', component: MonkeyType },
  { id: 'wordle', name: 'Wordle', icon: '🎯', component: WordleClone },
  { id: 'pacman', name: 'Pacman', icon: '👾', component: Pacman },
  { id: 'memeDecoder', name: 'Meme Decoder', icon: '🎭', component: MemeDecoder },
  { id: 'emoji', name: 'Emoji Game', icon: '😂', component: Emoji },
];

import { API_URL } from './config';

function AdminDashboard() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);

  // Game Control State
  const [gameActive, setGameActive] = useState(false);
  const [gameControlLoading, setGameControlLoading] = useState(false);

  // Registration State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState(''); // NEW: Custom Email
  const [newTeamPassword, setNewTeamPassword] = useState('');
  const [regMessage, setRegMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleStartGame = async () => {
    setGameControlLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/start-game`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setGameActive(data.gameActive);
      }
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setGameControlLoading(false);
    }
  };

  const handleStopGame = async () => {
    setGameControlLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/stop-game`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setGameActive(data.gameActive);
      }
    } catch (error) {
      console.error('Error stopping game:', error);
    } finally {
      setGameControlLoading(false);
    }
  };

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    setRegMessage('');
    setIsRegistering(true);

    let createdUser = null;

    try {
      // 1. Sanitize Team Name
      const finalTeamName = newTeamName.trim();
      const finalEmail = newTeamEmail.trim();

      // Validate password length
      if (newTeamPassword.length < 6) {
        setRegMessage('❌ Password must be at least 6 characters long.');
        setIsRegistering(false);
        return;
      }

      // 2. Register in Firebase with timeout
      console.log(`Creating user: ${finalEmail} for team: ${finalTeamName}`);

      // Add timeout to prevent hanging
      const createUserPromise = createUserWithEmailAndPassword(auth, finalEmail, newTeamPassword)
        .then((cred) => {
          createdUser = cred.user;
          return cred;
        });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout - check your internet connection')), 15000)
      );

      let userCredential;
      try {
        userCredential = await Promise.race([createUserPromise, timeoutPromise]);
      } catch (err) {
        if (err?.message?.includes('Firebase timeout')) {
          createUserPromise
            .then((cred) => cred.user.delete())
            .catch(() => {});
        }
        throw err;
      }
      console.log('✅ Firebase user created successfully');

      // 3. Link Team Name to User Profile
      await updateProfile(userCredential.user, {
        displayName: finalTeamName
      });
      console.log('✅ Display name updated');

      // 4. Register in Backend
      console.log('Registering team in backend...');
      const response = await fetch(`${API_URL}/api/register-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: finalTeamName })
      });

      const data = await response.json();

      if (response.ok) {
        setRegMessage(`✅ Success! Registered "${finalTeamName}" linked to ${finalEmail}`);
        setNewTeamName('');
        setNewTeamEmail('');
        setNewTeamPassword('');
        setLoading(true); // Trigger re-fetch

        // Sign out the new user
        await signOut(auth);
        console.log('✅ Registration complete');

      } else {
        setRegMessage(`⚠️ Backend Error: ${data.error}`);
        // Clean up Firebase user if backend registration fails
        if (userCredential?.user) {
          await userCredential.user.delete();
        }
      }

    } catch (error) {
      console.error('Registration error:', error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = 'Email already registered.';
      if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      if (error.code === 'auth/weak-password') msg = 'Password is too weak. Use at least 6 characters.';
      if (error.code === 'auth/network-request-failed') msg = 'Network error. Check your internet connection.';
      setRegMessage(`❌ Error: ${msg}`);
      if (createdUser) {
        try {
          await createdUser.delete();
        } catch (cleanupError) {
          console.warn('Failed to clean up Firebase user:', cleanupError);
        }
      }
    } finally {
      setIsRegistering(false);
    }
  };



  // 1. Session Check
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) navigate('/admin');
  }, [navigate]);

  // 2. Batched Data Fetching (combines leaderboard + game status)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/dashboard-data`);
        if (response.ok) {
          const data = await response.json();
          setTeams(data.teams);
          setGameActive(data.gameActive);
        } else {
          throw new Error('Backend offline');
        }
      } catch (error) {
        console.log('⚠️ Backend unreachable');
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    // Only poll when tab is visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };

    fetchDashboardData();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    }, 10000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);



  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminSession');
    navigate('/');
  }, [navigate]);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.totalScore - a.totalScore);
  }, [teams]);

  if (selectedGame) {
    return <AdminGameViewer gameId={selectedGame} onClose={() => setSelectedGame(null)} />;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar / Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <img src={acmLogo} alt="Logo" className="nav-logo" />
          <div className="nav-text">
            <h1>Admin Panel</h1>
            <p>Dev Relay 2026</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </nav>

      <main className="dashboard-content">
        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <h3>Active Teams</h3>
            <p className="stat-number">{teams.length}</p>
          </div>
          <div className="stat-card highlight">
            <h3>Top Score</h3>
            <p className="stat-number">{sortedTeams[0]?.totalScore || 0}</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: gameActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)', borderColor: gameActive ? '#4CAF50' : '#FFC107' }}>
            <h3>Game Status</h3>
            <p className="stat-number" style={{ fontSize: '1.2rem', color: gameActive ? '#4CAF50' : '#FFC107' }}>
              {gameActive ? '🟢 LIVE' : '🟡 WAITING'}
            </p>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleStartGame}
                disabled={gameControlLoading || gameActive}
                style={{
                  padding: '8px 16px',
                  borderRadius: '5px',
                  border: 'none',
                  background: gameActive ? '#555' : '#4CAF50',
                  color: 'white',
                  cursor: (gameControlLoading || gameActive) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                ▶ Start
              </button>
              <button
                onClick={handleStopGame}
                disabled={gameControlLoading || !gameActive}
                style={{
                  padding: '8px 16px',
                  borderRadius: '5px',
                  border: 'none',
                  background: !gameActive ? '#555' : '#f44336',
                  color: 'white',
                  cursor: (gameControlLoading || !gameActive) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                ⏸ Stop
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="dashboard-grid">

          {/* Left: Leaderboard */}
          <section className="panel leaderboard-panel">
            <div className="panel-header">
              <h2>🏆 Live Standings</h2>
              <span className="live-indicator">● LIVE</span>
            </div>

            <div className="table-container">
              {loading ? (
                <div className="loading-state">Syncing Data...</div>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th className="th-rank">Rank</th>
                      <th className="th-team">Team</th>
                      <th>Monkey</th>
                      <th>Wordle</th>
                      <th>Pacman</th>
                      <th>Meme</th>
                      <th>Emoji</th>
                      <th>Unlocks</th>
                      <th className="th-total">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((team, index) => (
                      <tr key={team.teamName} className={`rank-row rank-${index + 1}`}>
                        <td className="td-rank">
                          <RankBadge index={index} />
                        </td>
                        <td className="td-team">{team.teamName}</td>
                        <td>{team.monkeytypeScore}</td>
                        <td>{team.wordleScore}</td>
                        <td>{team.pacmanScore}</td>
                        <td>{team.memodecoderScore}</td>
                        <td>{team.emojiScore}</td>
                        <td>{team.unlocksCount || 0}/6</td>
                        <td className="td-total">{team.totalScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Right: Game Launcher */}
          <section className="panel games-panel">
            <div className="panel-header">
              <h2>🕹️ Game Monitor</h2>
            </div>
            <div className="games-grid">
              {GAMES.map((game) => (
                <div key={game.id} className="game-card" onClick={() => setSelectedGame(game.id)}>
                  <div className="game-icon-circle">{game.icon}</div>
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <span>Click to Test</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Registration Panel */}
          <section className="panel registration-panel" style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
            <div className="panel-header">
              <h2>📝 Register New Team</h2>
            </div>
            <div className="registration-content" style={{ padding: '20px' }}>
              <form onSubmit={handleRegisterTeam} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label>Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Code Ninjas"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={newTeamEmail}
                    onChange={(e) => setNewTeamEmail(e.target.value)}
                    required
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label>Password</label>
                  <input
                    type="text"
                    placeholder="Set Password"
                    value={newTeamPassword}
                    onChange={(e) => setNewTeamPassword(e.target.value)}
                    required
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: 'white' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: 'none',
                    background: isRegistering ? '#555' : '#4CAF50',
                    color: 'white',
                    cursor: isRegistering ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {isRegistering ? 'Registering...' : 'Add Team'}
                </button>
              </form>
              {regMessage && (
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  borderRadius: '5px',
                  background: regMessage.includes('Success') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  border: `1px solid ${regMessage.includes('Success') ? '#4CAF50' : '#F44336'}`,
                  color: 'white'
                }}>
                  {regMessage}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Helper: Renders the rank icon
const RankBadge = ({ index }) => {
  if (index === 0) return <span className="badge gold">🥇 1st</span>;
  if (index === 1) return <span className="badge silver">🥈 2nd</span>;
  if (index === 2) return <span className="badge bronze">🥉 3rd</span>;
  return <span className="badge normal">#{index + 1}</span>;
};

// Sub-Component: The Full Screen Game Viewer
function AdminGameViewer({ gameId, onClose }) {
  const gameConfig = GAMES.find((g) => g.id === gameId);
  const GameComponent = gameConfig?.component;

  return (
    <div className="game-viewer-overlay">
      <div className="viewer-topbar">
        <button onClick={onClose} className="back-button">
          ← Exit Test Mode
        </button>
        <h2>Currently Testing: <span className="highlight-text">{gameConfig?.name}</span></h2>
        <div className="status-badge">🟢 System Online</div>
      </div>
      <div className="viewer-stage">
        {GameComponent ? <GameComponent /> : <p>Game component not found.</p>}
      </div>
    </div>
  );
}

export default AdminDashboard;