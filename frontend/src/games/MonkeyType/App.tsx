
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.tsx';
import TypingTest from './components/TypingTest.tsx';
import ResultView from './components/ResultView.tsx';
import ThemeSelector from './components/ThemeSelector.tsx';
import { THEMES } from './constants.tsx';
import { TestSettings, TestResult } from './types';
import './App.css';

const MonkeyType: React.FC = () => {
  const [settings, setSettings] = useState<TestSettings>({
    theme: 'dark'
  });

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const activeTheme = useMemo(() =>
    THEMES.find(t => t.id === settings.theme) || THEMES[0],
    [settings.theme]
  );

  useEffect(() => {
    document.body.style.backgroundColor = activeTheme.bgColor;
    document.body.style.color = activeTheme.subColor;
  }, [activeTheme]);

  const handleTestEnd = (result: TestResult) => {
    setTestResult(result);
    setIsTestRunning(false);
  };

  const startTest = () => {
    setTestResult(null);
    setIsTestRunning(false);
  };

  const resetTest = () => {
    setTestResult(null);
    setIsTestRunning(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: activeTheme.bgColor, color: activeTheme.subColor }}
    >
      <Navbar
        theme={activeTheme}
        onToggleThemeSelector={() => setShowThemeSelector(!showThemeSelector)}
        isTestRunning={isTestRunning}
        onReset={resetTest}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
        <div className="w-full">
          {testResult ? (
            <ResultView
              result={testResult}
              theme={activeTheme}
              onRestart={startTest}
            />
          ) : (
            <TypingTest
              theme={activeTheme}
              onTestEnd={handleTestEnd}
              isTestRunning={isTestRunning}
              setIsTestRunning={setIsTestRunning}
            />
          )}
        </div>
      </main>

      {showThemeSelector && (
        <ThemeSelector
          currentTheme={settings.theme}
          onSelect={(themeId) => {
            setSettings(prev => ({ ...prev, theme: themeId }));
            setShowThemeSelector(false);
          }}
          onClose={() => setShowThemeSelector(false)}
          theme={activeTheme}
        />
      )}

      <footer className="py-8 text-center text-xs opacity-50 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-4 opacity-70">
          <span>Press <kbd className="bg-gray-700/20 px-1 rounded">Tab</kbd> + <kbd className="bg-gray-700/20 px-1 rounded">Enter</kbd> to restart</span>
          <span>&bull;</span>
          <span>MonkeyType v1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default MonkeyType;
