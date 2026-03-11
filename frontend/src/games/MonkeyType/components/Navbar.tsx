
import React from 'react';
import { Theme } from '../types';
import acmLogo from '../../../assets/acm_logo.png';

interface NavbarProps {
  theme: Theme;
  onToggleThemeSelector: () => void;
  isTestRunning: boolean;
  onReset: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, onToggleThemeSelector, isTestRunning, onReset }) => {
  return (
    <nav className="flex items-center justify-between py-6 px-8 max-w-6xl mx-auto w-full">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onReset}
      >
        
        <img src={acmLogo} alt="ACM Logo" className="club-logo" />
        <h1 
          className="text-2xl font-bold tracking-tight mono"
          style={{ color: theme.textColor }}
        >
          ACMTypist
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleThemeSelector}
          className="p-2 rounded-lg hover:bg-black/10 transition-colors"
          title="Change Theme"
          style={{ color: theme.subColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
