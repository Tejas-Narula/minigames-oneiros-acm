
import React from 'react';
import { TestResult, Theme } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultViewProps {
  result: TestResult;
  theme: Theme;
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, theme, onRestart }) => {
  const points = Math.round((2 / 5) * result.accuracy);

  return (
    <div className="w-full animate-in fade-in zoom-in duration-500 flex flex-col items-center">
      <div className="mb-8 text-center animate-bounce">
        <h2 className="text-5xl font-bold mono" style={{ color: theme.successColor }}>🏆 {points} Points!</h2>
        <p className="mt-2 opacity-60">Scored {Math.round(2/5 * 100)}% of your {result.accuracy}% accuracy</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 w-full">
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-widest opacity-50 mb-1">WPM</span>
          <span className="text-6xl font-bold mono" style={{ color: result.wpm >= 60 ? theme.successColor : theme.mainColor }}>{result.wpm}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-widest opacity-50 mb-1">Accuracy</span>
          <span className="text-6xl font-bold mono" style={{ color: result.accuracy >= 80 ? theme.successColor : theme.mainColor }}>{result.accuracy}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-widest opacity-50 mb-1">Raw WPM</span>
          <span className="text-4xl font-bold mono opacity-80" style={{ color: theme.textColor }}>{result.rawWpm}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-widest opacity-50 mb-1">Time</span>
          <span className="text-4xl font-bold mono opacity-80" style={{ color: theme.textColor }}>{Math.round(result.time)}s</span>
        </div>
      </div>

      <div className="h-64 w-full mb-12 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.history}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={`${theme.subColor}22`} />
            <XAxis dataKey="time" hide />
            <YAxis 
              domain={[0, 'auto']} 
              stroke={theme.subColor} 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme.bgColor, 
                border: `1px solid ${theme.subColor}33`,
                borderRadius: '8px',
                color: theme.textColor,
                fontFamily: 'JetBrains Mono'
              }}
              labelStyle={{ display: 'none' }}
            />
            <Line 
              type="monotone" 
              dataKey="wpm" 
              stroke={theme.mainColor} 
              strokeWidth={3} 
              dot={false}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={onRestart}
          className="px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
          style={{ backgroundColor: theme.mainColor, color: theme.bgColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
          Play Again
        </button>

        <div className="flex gap-4 opacity-40">
           <div className="text-xs">Chars: {result.characters}</div>
           <div className="text-xs">Errors: {result.errors}</div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
