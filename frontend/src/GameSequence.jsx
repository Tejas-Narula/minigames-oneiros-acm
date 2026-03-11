import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Sparkles, Clock } from 'lucide-react';
import MonkeyType from './games/MonkeyType/App';
import WordleClone from './games/Wordle';
import Pacman from './games/Pacman/App';
import MemeDecoder from './games/MemeDecoder/App';
import Emoji from './games/Emoji/Emoji';
import { useGame } from './GameContext'; // UPDATED IMPORTS
import UnlocksSidebar from './UnlocksSidebar';
import acmLogo from './assets/acm_logo.png';
import './GameSequence.css';

// --- TIMER WRAPPER COMPONENT (10 MINUTES PER GAME) ---
function GameTimerWrapper({ children, onTimeout, gameName, onTimeUpdate }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const timerTriggeredRef = useRef(false);

  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !timerTriggeredRef.current) {
      timerTriggeredRef.current = true;
      console.warn(`⏱️ Time expired for ${gameName}! Moving to next game without unlock.`);
      onTimeout();
    }
    return () => clearInterval(interval);
  }, [timeLeft, onTimeout, gameName]);

  // Update parent with time
  useEffect(() => {
    onTimeUpdate(timeLeft);
  }, [timeLeft, onTimeUpdate]);

  return (
    <div className="relative w-full h-full">
      {children}
    </div>
  );
}

// --- GAME CONFIGURATION ---
const GAMES = [
  { id: 'monkeytype', name: 'MonkeyType', component: MonkeyType },
  { id: 'wordle', name: 'Wordle', component: WordleClone },
  { id: 'memeDecoder', name: 'Meme Decoder', component: MemeDecoder },
  { id: 'emoji', name: 'Emoji Game', component: Emoji },
  { id: 'pacman', name: 'Pacman', component: Pacman },
];

// --- GAME WRAPPERS (Win Detection Logic) ---
// These detect when a game finishes by watching the DOM

function MonkeyTypeWrapper({ onGameComplete, onTimeout, onTimeUpdate }) {
  const containerRef = useRef(null);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    const checkForCompletion = () => {
      if (hasDetectedRef.current) return;

      const text = containerRef.current?.textContent || '';
      // Only advance if player PASSED the threshold
      const hasPassMessage = text.includes('Congrats, you passed');
      
      // Detect restart button with exact text
      const restartButton = Array.from(containerRef.current?.querySelectorAll('button') || []).some(btn => {
        const btnText = btn.textContent?.trim() || '';
        return btnText.includes('Try Again') || btnText === 'Retry Challenge';
      });

      if (hasPassMessage && restartButton) {
        hasDetectedRef.current = true;
        // Extract WPM score from the large number display
        const wpmMatch = text.match(/WPM\s*(\d+)/i);
        const rawWpm = wpmMatch ? parseInt(wpmMatch[1]) : 0;
        const score = rawWpm * 10;
        console.log('🎮 MonkeyType completed! WPM:', rawWpm, 'Score:', score);
        onGameComplete(score);
      }
    };

    const observer = new MutationObserver(checkForCompletion);
    if (containerRef.current) observer.observe(containerRef.current, { childList: true, subtree: true });
    const interval = setInterval(checkForCompletion, 3000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [onGameComplete]);

  return (
    <GameTimerWrapper onTimeout={onTimeout} gameName="MonkeyType" onTimeUpdate={onTimeUpdate}>
      <div ref={containerRef} style={{ height: '100%' }}><MonkeyType /></div>
    </GameTimerWrapper>
  );
}

function WordleWrapper({ onGameComplete, onTimeout, onTimeUpdate }) {
  const containerRef = useRef(null);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    const checkGameCompletion = () => {
      if (hasDetectedRef.current) return;
      
      const allText = containerRef.current?.innerText || '';
      const hasWon = allText.includes('You Won!');
      const hasNextRound = allText.includes('Next Round') || allText.includes('Advancing');

      if (hasWon && hasNextRound) {
        hasDetectedRef.current = true;
        // Wordle score: 1000 points for win
        onGameComplete(1000);
      }
    };
    const interval = setInterval(checkGameCompletion, 2000);
    return () => clearInterval(interval);
  }, [onGameComplete]);

  return (
    <GameTimerWrapper onTimeout={onTimeout} gameName="Wordle" onTimeUpdate={onTimeUpdate}>
      <div ref={containerRef} style={{ height: '100%' }}><WordleClone onUnlock={onGameComplete} /></div>
    </GameTimerWrapper>
  );
}

function PacmanWrapper({ onGameComplete, onTimeout, onTimeUpdate, teamName }) {
  const containerRef = useRef(null);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    const checkForCompletion = () => {
      if (hasDetectedRef.current) return;

      const text = containerRef.current?.textContent || '';
      const hasMissionComplete = text.includes('MISSION COMPLETE');
      const restartButtons = Array.from(containerRef.current?.querySelectorAll('button') || []).filter(btn =>
        btn.textContent?.includes('PLAY AGAIN')
      );
      const hasRestartButton = restartButtons.length > 0;

      if (hasMissionComplete && hasRestartButton) {
        hasDetectedRef.current = true;
        // Hide restart buttons to prevent interference during transition
        restartButtons.forEach(btn => btn.style.display = 'none');
        // Extract Pacman score and scale down by 10x (12000 = 1200 points)
        const scoreMatch = text.match(/FINAL SCORE[:\s]+(\d+)/);
        const rawScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        const score = Math.round(rawScore / 10);
        console.log('Pacman completed! Raw:', rawScore, 'Scaled:', score);
        onGameComplete(score);
      }
    };
    const observer = new MutationObserver(checkForCompletion);
    if (containerRef.current) observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [onGameComplete]);

  return (
    <GameTimerWrapper onTimeout={onTimeout} gameName="Pacman" onTimeUpdate={onTimeUpdate}>
      <div ref={containerRef} style={{ height: '100%' }}><Pacman initialTeamName={teamName} /></div>
    </GameTimerWrapper>
  );
}

function MemeDecoderWrapper({ onGameComplete, onTimeout, onTimeUpdate }) {
  const containerRef = useRef(null);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    const checkForCompletion = () => {
      if (hasDetectedRef.current) return;
      const text = containerRef.current?.textContent || '';
      // Check for MemeDecoder completion states (case-insensitive)
      const hasGameEnd = text.includes('SYSTEM SECURED') ||
        text.includes('CRITICAL FAILURE') ||
        text.includes('FINAL SCORE');

      if (hasGameEnd) {
        hasDetectedRef.current = true;
        // Extract score and scale by 25x (40 points max = 1000)
        const scoreMatch = text.match(/(?:FINAL )?SCORE[:\s]+(\d+)/);
        const rawScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        const score = rawScore * 25;
        console.log('🎮 MemeDecoder completed! Raw:', rawScore, 'Scaled:', score);
        onGameComplete(score);
      }
    };
    const observer = new MutationObserver(checkForCompletion);
    if (containerRef.current) observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [onGameComplete]);

  return (
    <GameTimerWrapper onTimeout={onTimeout} gameName="Meme Decoder" onTimeUpdate={onTimeUpdate}>
      <div ref={containerRef} style={{ height: '100%' }}><MemeDecoder /></div>
    </GameTimerWrapper>
  );
}

function EmojiWrapper({ onGameComplete, onTimeout, onTimeUpdate }) {
  const containerRef = useRef(null);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    const checkForCompletion = () => {
      if (hasDetectedRef.current) return;
      const text = containerRef.current?.textContent || '';
      const hasGameComplete = text.includes('Game Complete');

      if (hasGameComplete) {
        hasDetectedRef.current = true;
        // Hide any restart buttons to prevent interference
        const buttons = containerRef.current?.querySelectorAll('button') || [];
        buttons.forEach(btn => {
          if (btn.textContent?.includes('Play Again') || btn.textContent?.includes('Restart')) {
            btn.style.display = 'none';
          }
        });
        // Extract score and scale by 100x (15 correct = 1500)
        const scoreMatch = text.match(/Score[:\s]+(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) * 100 : 0;
        console.log('🎮 Emoji completed! Score:', score);
        onGameComplete(score);
      }
    };
    const observer = new MutationObserver(checkForCompletion);
    if (containerRef.current) observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [onGameComplete]);

  return (
    <GameTimerWrapper onTimeout={onTimeout} gameName="Emoji Game" onTimeUpdate={onTimeUpdate}>
      <div ref={containerRef} style={{ height: '100%' }}><Emoji /></div>
    </GameTimerWrapper>
  );
}

// --- MAIN COMPONENT ---

import { API_URL } from './config';

function GameSequence() {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state while fetching game progress
  const [gameTimeLeft, setGameTimeLeft] = useState(600); // Track current game timer
  const [allGamesComplete, setAllGamesComplete] = useState(false);

  // GLOBAL CONTEXT HOOKS
  // We use this to trigger global wins and checking for unlocks
  const { teamName, addWin, gamesWon, unlockedItems, UNLOCK_ITEMS } = useGame();

  // Local state for the Modal
  const [unlockedItem, setUnlockedItem] = useState(null);

  // Load game state from database on mount
  useEffect(() => {
    const loadGameState = async () => {
      console.log('🔄 Loading game state for team:', teamName);

      if (!teamName) {
        console.log('⚠️ No team name found, starting from game 0');
        setIsLoading(false);
        return;
      }

      // Try localStorage cache first
      const cacheKey = `gameState_${teamName}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { currentGameIndex, timestamp } = JSON.parse(cached);
          // Use cache if less than 30 seconds old
          if (Date.now() - timestamp < 30000) {
            console.log('✅ Using cached game state:', currentGameIndex);
            setCurrentGameIndex(currentGameIndex || 0);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }

      try {
        const response = await fetch(`${API_URL}/api/game-state/${encodeURIComponent(teamName)}`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Game state loaded:', data);
          const gameIndex = data.currentGameIndex || 0;
          setCurrentGameIndex(gameIndex);
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify({
            currentGameIndex: gameIndex,
            timestamp: Date.now()
          }));
        } else {
          console.log('⚠️ Team not found in database, starting from game 0');
        }
      } catch (error) {
        console.error('❌ Error loading game state:', error);
        // If error, just start from beginning
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, [teamName]);

  const currentGame = GAMES[currentGameIndex];
  const progress = ((currentGameIndex + 1) / GAMES.length) * 100;

  const handleGameTimeout = async () => {
    console.log(`⏱️ ${currentGame.name} timed out! Moving to next game without unlock.`);

    // NO WIN REGISTERED - just move to next game
    const nextGameIndex = currentGameIndex + 1;
    console.log(`💾 Saving game state (no win): team="${teamName}", nextGameIndex=${nextGameIndex}`);

    if (teamName) {
      try {
        const response = await fetch(`${API_URL}/api/save-game-state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamName: teamName,
            currentGameIndex: nextGameIndex
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Game state saved successfully:', result);          // Update localStorage cache
          localStorage.setItem(`gameState_${teamName}`, JSON.stringify({
            currentGameIndex: nextGameIndex,
            timestamp: Date.now()
          }));          // Update localStorage cache
          localStorage.setItem(`gameState_${teamName}`, JSON.stringify({
            currentGameIndex: nextGameIndex,
            timestamp: Date.now()
          }));
        } else {
          console.error('❌ Failed to save game state:', response.status);
        }
      } catch (error) {
        console.error('❌ Error saving game state:', error);
      }
    }

    // HANDLE SEQUENCE TRANSITION (NO UNLOCK MODAL)
    setShowTransition(true);
    setTimeout(() => {
      if (currentGameIndex < GAMES.length - 1) {
        setCurrentGameIndex(nextGameIndex);
        setShowTransition(false);
      } else {
        console.log('🎉 All games completed!');
      }
    }, 1500);
  };

  const handleGameComplete = async (score = 0) => {
    console.log(`✅ ${currentGame.name} completed with score: ${score}`);
    console.log(`📊 Team: ${teamName}, GameID: ${currentGame.id}`);

    // 1. SUBMIT SCORE TO BACKEND
    if (teamName && score >= 0) {
      try {
        console.log(`📤 Submitting score to ${API_URL}/api/update-score`);
        const scoreResponse = await fetch(`${API_URL}/api/update-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamName: teamName,
            gameId: currentGame.id,
            score: score
          })
        });

        if (scoreResponse.ok) {
          const result = await scoreResponse.json();
          console.log(`✅ Score ${score} submitted successfully for ${currentGame.id}:`, result);
        } else {
          const errorText = await scoreResponse.text();
          console.error('❌ Failed to submit score:', scoreResponse.status, errorText);
        }
      } catch (error) {
        console.error('❌ Error submitting score:', error);
      }
    } else {
      console.warn('⚠️ Score submission skipped:', { teamName, score, hasTeam: !!teamName });
    }

    // 2. REGISTER THE WIN GLOBALLY
    // addWin() returns an array of ANY items unlocked by this specific win
    const newUnlocks = addWin();

    // 3. CHECK FOR NEW UNLOCKS
    if (newUnlocks && newUnlocks.length > 0) {
      // If we unlocked something, show the modal!
      setUnlockedItem(newUnlocks[0]);
    }

    // 4. SAVE GAME PROGRESS TO DATABASE
    const nextGameIndex = currentGameIndex + 1;
    console.log(`💾 Saving game state: team="${teamName}", nextGameIndex=${nextGameIndex}`);

    if (teamName) {
      try {
        const response = await fetch(`${API_URL}/api/save-game-state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamName: teamName,
            currentGameIndex: nextGameIndex
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Game state saved successfully:', result);
        } else {
          console.error('❌ Failed to save game state:', response.status);
        }
      } catch (error) {
        console.error('❌ Error saving game state:', error);
      }
    } else {
      console.warn('⚠️ Cannot save game state: teamName is empty');
    }

    // 4. HANDLE SEQUENCE TRANSITION
    setShowTransition(true);
    setTimeout(() => {
      if (currentGameIndex < GAMES.length - 1) {
        setCurrentGameIndex(nextGameIndex);
        setShowTransition(false);
      } else {
        console.log('🎉 All games completed!');
        setAllGamesComplete(true);
        setShowTransition(false);
      }
    }, 2000); // Increased delay slightly to let user see the unlock
  };

  const renderGameComponent = () => {
    switch (currentGame.id) {
      case 'monkeytype': return <MonkeyTypeWrapper onGameComplete={handleGameComplete} onTimeout={handleGameTimeout} onTimeUpdate={setGameTimeLeft} />;
      case 'wordle': return <WordleWrapper onGameComplete={handleGameComplete} onTimeout={handleGameTimeout} onTimeUpdate={setGameTimeLeft} />;
      case 'memeDecoder': return <MemeDecoderWrapper onGameComplete={handleGameComplete} onTimeout={handleGameTimeout} onTimeUpdate={setGameTimeLeft} />;
      case 'emoji': return <EmojiWrapper onGameComplete={handleGameComplete} onTimeout={handleGameTimeout} onTimeUpdate={setGameTimeLeft} />;
      case 'pacman': return <PacmanWrapper onGameComplete={handleGameComplete} onTimeout={handleGameTimeout} onTimeUpdate={setGameTimeLeft} teamName={teamName} />;
      default: return null;
    }
  };

  // Show loading screen while fetching game state
  if (isLoading) {
    return (
      <div className="game-sequence-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading your progress...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-sequence-container">

      {/* ACM Logo */}
      <img
        src={acmLogo}
        alt="ACM Logo"
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 9999,
          width: '48px',
          height: '48px',
          objectFit: 'contain',
          borderRadius: '8px',
          pointerEvents: 'none',
        }}
      />

      {/* --- GLOBAL UNLOCK MODAL --- */}
      {/* This sits on top of EVERYTHING when active */}
      {unlockedItem && (
        <div className="unlock-modal-overlay">
          <div className="unlock-card animate-scaleIn">
            <div className="unlock-icon-wrapper">
              <Trophy size={60} className="text-white animate-bounce" />
              <Sparkles size={24} className="unlock-sparkle s1" />
              <Sparkles size={24} className="unlock-sparkle s2" />
            </div>

            <h2 className="unlock-title">NEW UNLOCK!</h2>

            <div className="unlock-details">
              <h3>{unlockedItem.name}</h3>
              <p>{unlockedItem.description}</p>
            </div>

            <button
              onClick={() => setUnlockedItem(null)}
              className="unlock-btn"
            >
              CONTINUE MISSION
            </button>
          </div>
        </div>
      )}

      {/* All Games Complete Screen */}
      {allGamesComplete && (
        <div className="unlock-modal-overlay">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', maxWidth: '1200px' }}>
            <div className="unlock-card animate-scaleIn" style={{ maxWidth: '600px', flex: 1 }}>
              <div className="unlock-icon-wrapper" style={{ marginBottom: '24px' }}>
                <Trophy size={80} className="text-yellow-400 animate-bounce" />
              </div>

              <h2 className="text-5xl font-bold text-white mb-4">
                ALL GAMES COMPLETED! 
              </h2>
              
              <div className="bg-white/10 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Mission Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-black/30 rounded p-4">
                    <p className="text-gray-400 text-sm mb-1">Team Name</p>
                    <p className="text-xl font-bold text-white">{teamName}</p>
                  </div>
                  <div className="bg-black/30 rounded p-4">
                    <p className="text-gray-400 text-sm mb-1">Games Completed</p>
                    <p className="text-xl font-bold text-green-400">{GAMES.length}/{GAMES.length}</p>
                  </div>
                  <div className="bg-black/30 rounded p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Wins</p>
                    <p className="text-xl font-bold text-blue-400">{gamesWon}</p>
                  </div>
                  <div className="bg-black/30 rounded p-4">
                    <p className="text-gray-400 text-sm mb-1">Unlocks</p>
                    <p className="text-xl font-bold text-purple-400">{unlockedItems.length}/{UNLOCK_ITEMS.length}</p>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-300 mb-6">
                Congratulations! You've successfully completed all challenges in the Dev Relay!
              </p>

              <button
                onClick={() => window.location.href = '/welcome'}
                className="unlock-btn"
                style={{ fontSize: '18px', padding: '16px 32px' }}
              >
                RETURN TO LOBBY
              </button>
            </div>
            
            <div style={{ width: '320px', height: '600px' }}>
              <UnlocksSidebar />
            </div>
          </div>
        </div>
      )}

      {/* 1. Header (Top Bar) */}
      <header className="sequence-header">
        <div className="header-content">
          <div className="mission-info">
            <span className="mission-label">CURRENT OPERATION</span>
            <h2 className="mission-title">
              {currentGame.name.toUpperCase()}
              <span className="step-count"> [{currentGameIndex + 1}/{GAMES.length}]</span>
            </h2>
          </div>
          <div className="progress-section">
            <div className="progress-label">
              <span>SEQUENCE PROGRESS</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="xp-bar-container">
              <div className="xp-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="timer-display">
            <Clock size={18} />
            <span className="font-mono font-bold">
              {String(Math.floor(gameTimeLeft / 60)).padStart(2, '0')}:{String(gameTimeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="unlock-count-display">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm font-bold text-white">Unlocks: {unlockedItems.length}/{UNLOCK_ITEMS.length}</span>
          </div>
        </div>
      </header>

      {/* 2. Main Stage (Split Layout) */}
      <main className={`game-stage-layout ${showTransition ? 'fade-out' : 'fade-in'}`}>

        {/* LEFT: Game Content */}
        <div className="game-content-area">
          {renderGameComponent()}
        </div>

        {/* RIGHT: Unlock Sidebar */}
        <div className="global-sidebar-area">
          <UnlocksSidebar />
        </div>

      </main>
    </div>
  );
}

export default GameSequence;