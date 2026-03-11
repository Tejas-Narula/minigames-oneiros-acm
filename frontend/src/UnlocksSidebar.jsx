import React from 'react';
import { Lock, Unlock, Sparkles } from 'lucide-react';
import { useGame } from './GameContext';

export default function UnlocksSidebar() {
  const { gamesWon, unlockedItems, UNLOCK_ITEMS } = useGame();

  const isItemUnlocked = (itemId) => unlockedItems.includes(itemId);
  const lockedCount = UNLOCK_ITEMS.filter(item => !isItemUnlocked(item.id)).length;
  
  // Sort: Unlocked first (newest to oldest), then locked
  const sortedItems = [...UNLOCK_ITEMS].sort((a, b) => {
    const aUnlocked = isItemUnlocked(a.id);
    const bUnlocked = isItemUnlocked(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    if (aUnlocked && bUnlocked) return b.gamesRequired - a.gamesRequired; // Descending for unlocked
    return a.gamesRequired - b.gamesRequired; // Ascending for locked
  });

  return (
    <div className="w-80 bg-gray-800 rounded-lg overflow-hidden flex flex-col h-full border border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h2 className="text-xl font-bold flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-400" />
            <span>Global Unlocks</span>
          </div>
          <div className="text-xs font-normal text-gray-400 bg-gray-900 px-2 py-1 rounded">
            {unlockedItems.length}/{UNLOCK_ITEMS.length}
          </div>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedItems.map((item) => {
          const unlocked = isItemUnlocked(item.id);

          if (unlocked) {
            return (
              <div key={item.id} className="p-3 rounded-lg border border-green-500/30 bg-green-900/20">
                <div className="flex items-start gap-3">
                  <Unlock size={18} className="text-green-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <p className="text-xs text-green-200/70">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={item.id} className="p-3 rounded-lg border border-gray-600 bg-gray-700/50 opacity-70">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-gray-500" />
                  <h3 className="font-bold text-gray-500 text-sm">???</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-8">
                  Win {item.gamesRequired - gamesWon} more
                </p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}