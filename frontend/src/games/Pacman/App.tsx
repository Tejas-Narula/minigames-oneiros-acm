import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './screens/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { GameStatus } from './types';

interface AppProps {
  initialTeamName?: string;
}

const App: React.FC<AppProps> = ({ initialTeamName = '' }) => {
  const [status, setStatus] = useState<GameStatus>('START');
  const [teamName, setTeamName] = useState('');
  const [finalScore, setFinalScore] = useState(0);

  // Auto-start if team name is provided from context
  useEffect(() => {
    if (initialTeamName) {
      setTeamName(initialTeamName);
      setStatus('PLAYING');
    }
  }, [initialTeamName]);

  const handleStartGame = (name: string) => {
    setTeamName(name);
    setStatus('PLAYING');
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setStatus('GAME_OVER');
  };
  
  const handleGameWin = (score: number) => {
    setFinalScore(score);
    setStatus('VICTORY');
  };

  const handleRestart = () => {
    setStatus('START');
    setTeamName('');
    setFinalScore(0);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {status === 'START' && (
          <StartScreen onStart={handleStartGame} />
        )}

        {status === 'PLAYING' && (
          <GameScreen 
            teamName={teamName} 
            onGameOver={handleGameOver} 
            onGameWin={handleGameWin}
          />
        )}

        {(status === 'GAME_OVER' || status === 'VICTORY' || status === 'LEADERBOARD') && (
          <LeaderboardScreen 
            currentScore={finalScore} 
            teamName={teamName}
            onRestart={handleRestart}
            isGameOver={status === 'GAME_OVER' || status === 'VICTORY'}
            isVictory={status === 'VICTORY'}
          />
        )}
      </div>
    </div>
  );
};

export default App;