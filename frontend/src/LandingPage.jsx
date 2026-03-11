import React from 'react';
import './LandingPage.css';
import acmLogo from './assets/acm_logo.png';
import grassImg from './assets/grass.png';
import { useNavigate } from 'react-router-dom';

const GAMES = [
  { id: 'monkeytype', name: 'MonkeyType', icon: '⌨️', description: 'Test your typing speed', path: '/monkeytype' },
  // { id: 'wordle', name: 'Wordle', icon: '🎯', description: 'Guess the 5-letter word', path: '/wordle' },
  { id: 'pacman', name: 'Pacman', icon: '👾', description: 'Classic arcade action', path: '/pacman' },
  { id: 'memeDecoder', name: 'Meme Decoder', icon: '🎭', description: 'Identify blurred memes', path: '/meme-decoder' },
  { id: 'emoji', name: 'Emoji Game', icon: '😂', description: 'Guess movies from emojis', path: '/emoji' },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="bg-rays"></div>

      <div className="content-wrapper">
        <header className="presenter-header">
          <img src={acmLogo} alt="ACM Logo" className="club-logo" />
          <div className="badge-container">
            <span className="club-badge">ACM STUDENT CHAPTER</span>
          </div>
        </header>

        <main className="main-content">
          <h1 className="event-title">MINI GAMES</h1>

          <p className="event-subtitle">
            Pick a game and start playing!
          </p>

          <div className="games-grid">
            {GAMES.map((game) => (
              <button
                key={game.id}
                className="game-card-btn"
                onClick={() => navigate(game.path)}
              >
                <span className="game-card-icon">{game.icon}</span>
                <span className="game-card-name">{game.name}</span>
                <span className="game-card-desc">{game.description}</span>
              </button>
            ))}
          </div>
        </main>
      </div>

      <div className="grass-container" style={{ backgroundImage: `url(${grassImg})` }}></div>
    </div>
  );
}

export default LandingPage;