import React, { useState, useEffect, useRef } from 'react';
import './Emoji.css';
import { Trophy } from 'lucide-react';

// --- THE BIG POOL OF MOVIES ---
const MOVIE_POOL = [
  { emojis: "👻🏰", title: "Ghostbusters" },
  { emojis: "💍⚔️", title: "Pride and Prejudice" },
  { emojis: "📸🏝️", title: "Shutter Island" },
  { emojis: "⚡👓", title: "Harry Potter" },
  { emojis: "🦖🏞️", title: "Jurassic Park" },
  { emojis: "🤖🔫", title: "Terminator" },
  { emojis: "👸🐸", title: "Princess and the Frog" },
  { emojis: "🐺🧱", title: "The Wolf of Wall Street" },
  { emojis: "💇‍♀️🏰", title: "Tangled" },
  { emojis: "🐀👨‍🍳", title: "Ratatouille" },
  { emojis: "🐼🥋", title: "Kung Fu Panda" },
  { emojis: "🤡🎈", title: "It" },
  { emojis: "🚢🧊", title: "Titanic" },
  { emojis: "🍫🏭", title: "Charlie and the Chocolate Factory" },
  { emojis: "👽🚲", title: "ET" },
  { emojis: "🧸🤠", title: "Toy Story" },
  { emojis: "🏴‍☠️🌊", title: "Pirates of the Caribbean" },
  { emojis: "🔍🐠", title: "Finding Nemo" },
  { emojis: "🖤🐆", title: "Black Panther" },
  { emojis: "👿👠", title: "The Devil Wears Prada" },
  { emojis: "👴🎈", title: "Up" },
  { emojis: "👽📞", title: "Arrival" },
  { emojis: "🥊🐯", title: "Rocky" },
  { emojis: "🧟‍♂️🚆", title: "Train to Busan" },
  { emojis: "🦍🏙️", title: "King Kong" },
  { emojis: "🦈🌊", title: "Jaws" },
  { emojis: "🚀🌌", title: "Star Wars" },
  { emojis: "🧙‍♂️💍", title: "Lord of the Rings" },
  { emojis: "🚗💨", title: "Fast and Furious" },
  { emojis: "💊🕶️", title: "The Matrix" },
  { emojis: "🧛‍♂️💘", title: "Twilight" }
];

const QUESTIONS_PER_ROUND = 3;
const TOTAL_ROUNDS = 2;
const TOTAL_QUESTIONS = QUESTIONS_PER_ROUND * TOTAL_ROUNDS;

// --- UTILITY: Shuffle Function ---
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function MovieEmoji({ onUnlock }) {
  const [gameMovies, setGameMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'correct' | 'finished'
  const [shake, setShake] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(null);
  const [localWins, setLocalWins] = useState(0);

  const inputRef = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const shuffled = shuffleArray(MOVIE_POOL);
    const selected = shuffled.slice(0, TOTAL_QUESTIONS);
    setGameMovies(selected);
  }, []);

  if (gameMovies.length === 0) return null;

  const currentRound = Math.floor(currentIndex / QUESTIONS_PER_ROUND) + 1;
  const questionNumberInRound = (currentIndex % QUESTIONS_PER_ROUND) + 1;
  const currentMovie = gameMovies[currentIndex];
  const isLastQuestion = currentIndex === gameMovies.length - 1;

  // Auto-focus logic
  if (inputRef.current && !showIntro && gameStatus === 'playing') {
    inputRef.current.focus();
  }

  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const handleInputChange = (e) => {
    if (gameStatus !== 'playing') return;
    if (e.target.value.length <= normalize(currentMovie.title).length) {
      setUserInput(e.target.value);
    }
  };

  const checkAnswer = () => {
    if (gameStatus !== 'playing') return;

    if (normalize(userInput) === normalize(currentMovie.title)) {
      setGameStatus('correct');
      setScore(prev => prev + 10);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < gameMovies.length) {
      setCurrentIndex(nextIndex);
      setUserInput("");
      setGameStatus('playing');

      if (nextIndex % QUESTIONS_PER_ROUND === 0) {
        const newWins = localWins + 1;
        setLocalWins(newWins);
        setShowIntro(true);
      }
    } else {
      setGameStatus('finished');
    }
  };

  const renderSlots = () => {
    const words = currentMovie.title.split(' ');
    let globalCharIndex = 0;

    return words.map((word, wordIdx) => (
      <div key={wordIdx} className="word-group">
        {word.split('').map((char, charIdx) => {
          const userChar = userInput[globalCharIndex] || "";
          globalCharIndex++;
          let slotClass = "slot";
          if (userChar) slotClass += " filled";
          if (gameStatus === 'correct') slotClass += " correct";
          if (shake) slotClass += " shake";

          return <div key={charIdx} className={slotClass}>{userChar}</div>;
        })}
      </div>
    ));
  };

  // --- UNLOCK MODAL ---
  if (showUnlockModal) {
    return (
      <div className="emoji-game-wrapper">
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-8 rounded-2xl shadow-2xl max-w-md mx-4 text-center">
            <Trophy size={80} className="text-white mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">NEW UNLOCK!</h2>
            <div className="bg-white/20 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-black">{showUnlockModal.name}</h3>
              <p className="text-black/90">{showUnlockModal.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- INTRO SCREEN ---
  if (showIntro) {
    return (
      /* WRAPPER ADDED HERE */
      <div className="emoji-game-wrapper">
        <div className="app-container">
          <div className="intro-card">
            <div className="intro-content">
              <h1 className="round-title">ROUND {currentRound}</h1>
              <p className="round-subtitle">Get Ready for {QUESTIONS_PER_ROUND} Movies!</p>
              <button className="btn-start" onClick={() => setShowIntro(false)}>
                Let's Play
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME OVER ---
  if (gameStatus === 'finished') {
    return (
      /* WRAPPER ADDED HERE */
      <div className="emoji-game-wrapper">
        <div className="app-container">
          <div className="game-card">
            <h1>Game Complete!</h1>
            <div className="emoji-stage">🏆</div>
            <h2><span className="score-text">{score}</span> Points!</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '8px' }}>{score / 10} / {gameMovies.length} correct</p>
            <button className="game-btn btn-submit" onClick={() => { setCurrentIndex(0); setScore(0); setUserInput(''); setGameStatus('playing'); setLocalWins(0); setShowIntro(true); setGameMovies(shuffleArray(MOVIE_POOL).slice(0, TOTAL_QUESTIONS)); }}>Play Again</button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN GAME ---
  return (
    /* WRAPPER ADDED HERE */
    <div className="emoji-game-wrapper">
      <div className="app-container">
        <div className="game-card" onClick={() => inputRef.current?.focus()}>

          <div className="header">
            <div className="header-top">
              <span>Round {currentRound} / {TOTAL_ROUNDS}</span>
              <span><span className="score-text">{score}</span> pts</span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(questionNumberInRound / QUESTIONS_PER_ROUND) * 100}%` }}
              ></div>
            </div>

            <div className="round-counter">
              Movie #{questionNumberInRound} of {QUESTIONS_PER_ROUND}
            </div>
          </div>

          <div className="emoji-stage">
            {currentMovie.emojis}
          </div>

          <div className="slots-area">{renderSlots()}</div>

          {userInput === "" && gameStatus === 'playing' && (
            <div className="tap-hint">Tap anywhere to start typing</div>
          )}

          <input
            ref={inputRef} type="text" className="hidden-input"
            value={userInput} onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} autoComplete="off"
          />

          <div className="feedback-area">
            {gameStatus === 'correct' && `Correct! It was "${currentMovie.title}"`}
          </div>

          <div className="button-area">
            {gameStatus === 'playing' ? (
              <button className="game-btn btn-submit" onClick={checkAnswer}>Submit</button>
            ) : (
              <button className="game-btn btn-next" onClick={nextQuestion}>
                {isLastQuestion ? "Finish Game " : "Next Movie ➡"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}