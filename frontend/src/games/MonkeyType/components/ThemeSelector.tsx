
import React from 'react';
import { THEMES } from '../constants.tsx';
import { Theme } from '../types';

interface ThemeSelectorProps {
  currentTheme: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  theme: Theme;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onSelect, onClose, theme }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: theme.bgColor, color: theme.textColor, border: `1px solid ${theme.subColor}33` }}
      >
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: `${theme.subColor}22` }}>
          <h2 className="text-xl font-bold mono">Select Theme</h2>
          <button onClick={onClose} className="p-1 hover:opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all border-2 ${currentTheme === t.id ? 'border-current' : 'border-transparent'}`}
              style={{ 
                backgroundColor: `${t.bgColor}`,
                color: t.mainColor,
                borderColor: currentTheme === t.id ? t.mainColor : 'transparent'
              }}
            >
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bgColor, border: `1px solid ${t.subColor}` }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.mainColor }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.textColor }}></div>
              </div>
              <span className="font-medium mono text-sm">{t.name}</span>
            </button>
          ))}
        </div>

        <div className="p-6 text-center text-xs opacity-50" style={{ color: theme.subColor }}>
          Custom themes coming soon
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
