import { Theme, FontSettings } from '../types';

export const themes: Record<string, Theme> = {
  'purple-pink': {
    name: 'purple-pink',
    titleGradient: 'from-purple-300 to-pink-500',
    titleGradientFrom: '#c084fc',
    titleGradientTo: '#ec4899',
    backgroundColor: '#1f2937', // gray-800
    borderColor: '#374151', // gray-700
    textColor: '#d1d5db', // gray-300
  },
  'blue-cyan': {
    name: 'blue-cyan',
    titleGradient: 'from-blue-300 to-cyan-500',
    titleGradientFrom: '#93c5fd',
    titleGradientTo: '#06b6d4',
    backgroundColor: '#1e293b', // slate-800
    borderColor: '#334155', // slate-700
    textColor: '#cbd5e1', // slate-300
  },
  'green-emerald': {
    name: 'green-emerald',
    titleGradient: 'from-green-300 to-emerald-500',
    titleGradientFrom: '#86efac',
    titleGradientTo: '#10b981',
    backgroundColor: '#14532d', // green-900
    borderColor: '#166534', // green-800
    textColor: '#bbf7d0', // green-200
  },
  'orange-red': {
    name: 'orange-red',
    titleGradient: 'from-orange-300 to-red-500',
    titleGradientFrom: '#fdba74',
    titleGradientTo: '#ef4444',
    backgroundColor: '#7f1d1d', // red-900
    borderColor: '#991b1b', // red-800
    textColor: '#fecaca', // red-200
  },
  'dark-minimal': {
    name: 'dark-minimal',
    titleGradient: 'from-gray-200 to-gray-400',
    titleGradientFrom: '#e5e7eb',
    titleGradientTo: '#9ca3af',
    backgroundColor: '#111827', // gray-900
    borderColor: '#1f2937', // gray-800
    textColor: '#f3f4f6', // gray-100
  },
};

export const defaultFontSettings: FontSettings = {
  titleSize: 'medium',
  contentSize: 'medium',
  fontFamily: 'Inter',
};

export const fontSizes = {
  title: {
    small: 'text-2xl lg:text-3xl',
    medium: 'text-3xl lg:text-5xl',
    large: 'text-4xl lg:text-6xl',
    xlarge: 'text-5xl lg:text-7xl',
  },
  content: {
    small: 'text-sm lg:text-base',
    medium: 'text-base lg:text-xl',
    large: 'text-lg lg:text-2xl',
  },
};

export const fontFamilies = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Poppins', value: 'Poppins' },
];

