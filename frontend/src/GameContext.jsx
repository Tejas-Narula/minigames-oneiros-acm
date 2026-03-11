import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- 1. GLOBAL UNLOCK CONFIGURATION ---
export const UNLOCK_ITEMS = [
  { id: 1, name: 'Color Palette', description: 'Vibrant color scheme unlocked', gamesRequired: 1 },
  { id: 2, name: 'Sound Effects', description: 'Audio feedback enabled', gamesRequired: 2 },
  { id: 3, name: 'Statistics', description: 'Track your progress', gamesRequired: 3 },
  { id: 4, name: 'Dark Mode', description: 'Eye-friendly theme', gamesRequired: 4 },
  { id: 5, name: 'Animations', description: 'Smooth transitions', gamesRequired: 5 },
  { id: 6, name: 'Hard Mode', description: 'Challenge yourself', gamesRequired: 6 },
];

const GameContextInternal = createContext();

export const GameProvider = ({ children }) => {
  // --- EXISTING STATE (For GameSequence) ---
  const [gameCompleted, setGameCompleted] = useState(false);

  // Persist teamName in localStorage so it survives page refreshes
  const [teamName, setTeamName] = useState(() => {
    return localStorage.getItem('teamName') || '';
  });

  // --- NEW GLOBAL STATE (For Unlocks) ---
  // Initialize to Defaults. We will load from localStorage in useEffect when teamName changes.
  const [gamesWon, setGamesWon] = useState(0);
  const [unlockedItems, setUnlockedItems] = useState([]);

  // --- PERSISTENCE & LOADING LOGIC ---
  useEffect(() => {
    if (!teamName) {
      // If no team is logged in, reset to defaults
      setGamesWon(0);
      setUnlockedItems([]);
      return;
    }

    // LOAD state for this specific team
    const savedWins = localStorage.getItem(`gamesWon_${teamName}`);
    const savedUnlocks = localStorage.getItem(`unlockedItems_${teamName}`);

    if (savedWins) setGamesWon(parseInt(savedWins));
    else setGamesWon(0);

    if (savedUnlocks) setUnlockedItems([...new Set(JSON.parse(savedUnlocks))]);
    else setUnlockedItems([]);

  }, [teamName]); // Re-run whenever teamName changes (Login/Logout/Refresh)

  // SAVE state whenever it changes (only if teamName is set)
  useEffect(() => {
    if (teamName) {
      localStorage.setItem(`gamesWon_${teamName}`, gamesWon);
      localStorage.setItem(`unlockedItems_${teamName}`, JSON.stringify(unlockedItems));
      
      // Send unlock count to backend
      fetch(`${API_URL}/api/update-unlocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName,
          unlocksCount: unlockedItems.length
        })
      }).catch(err => console.error('Failed to update unlocks:', err));
    }
  }, [gamesWon, unlockedItems, teamName]);

  // Persist teamName separately (Global session)
  useEffect(() => {
    if (teamName) {
      localStorage.setItem('teamName', teamName);
    } else {
      localStorage.removeItem('teamName'); // Clear on logout
    }
  }, [teamName]);

  // --- EXISTING LOGIC ---
  const completeGame = useCallback(() => {
    setGameCompleted(true);
  }, []);

  const resetGame = useCallback(() => {
    setGameCompleted(false);
  }, []);

  // --- NEW UNLOCK LOGIC ---
  const addWin = useCallback(() => {
    const newTotal = gamesWon + 1;
    setGamesWon(newTotal);

    // Check if we unlock anything new
    const newlyUnlocked = UNLOCK_ITEMS.filter(item => {
      // Logic: If I have 1 win, I unlock items that require 1 win.
      return newTotal >= item.gamesRequired && !unlockedItems.includes(item.id);
    });

    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map(i => i.id);
      setUnlockedItems(prev => [...new Set([...prev, ...newIds])]);
    }

    return newTotal;
  }, [gamesWon, unlockedItems]);

  const value = {
    // Legacy (Game Sequence)
    gameCompleted,
    completeGame,
    resetGame,
    teamName,
    setTeamName,

    // New (Global Unlocks)
    gamesWon,
    unlockedItems,
    addWin,
    UNLOCK_ITEMS
  };

  return (
    <GameContextInternal.Provider value={value}>
      {children}
    </GameContextInternal.Provider>
  );
};

// --- HOOKS ---

// New generic hook
export const useGame = () => {
  const context = useContext(GameContextInternal);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useGameCompletion = useGame;