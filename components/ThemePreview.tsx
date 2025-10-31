import React from 'react';
import { ThemeName } from '../types';
import { themes } from '../constants/themes';

interface ThemePreviewProps {
  theme: ThemeName;
  onSelect?: () => void;
  isSelected?: boolean;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, onSelect, isSelected = false }) => {
  const themeData = themes[theme];
  
  return (
    <button
      onClick={onSelect}
      className={`relative p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-500/20 scale-105'
          : 'border-gray-700 hover:border-gray-600 hover:scale-102'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full shadow-md"
          style={{
            background: `linear-gradient(135deg, ${themeData.titleGradientFrom}, ${themeData.titleGradientTo})`,
          }}
        />
        <div className="text-white text-sm font-semibold capitalize">
          {theme.replace('-', ' ')}
        </div>
      </div>
      <div
        className="h-12 rounded relative overflow-hidden"
        style={{ backgroundColor: themeData.backgroundColor }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{
            background: `linear-gradient(135deg, ${themeData.titleGradientFrom}, ${themeData.titleGradientTo})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Preview
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default ThemePreview;

