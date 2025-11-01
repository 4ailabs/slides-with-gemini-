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
  // Nuevos temas profesionales
  'ocean-blue': {
    name: 'ocean-blue',
    titleGradient: 'from-blue-400 to-indigo-600',
    titleGradientFrom: '#60a5fa',
    titleGradientTo: '#4f46e5',
    backgroundColor: '#0f172a', // slate-900
    borderColor: '#1e293b', // slate-800
    textColor: '#e0e7ff', // indigo-100
  },
  'sunset-orange': {
    name: 'sunset-orange',
    titleGradient: 'from-yellow-400 to-orange-600',
    titleGradientFrom: '#facc15',
    titleGradientTo: '#ea580c',
    backgroundColor: '#431407', // orange-950
    borderColor: '#7c2d12', // orange-900
    textColor: '#fed7aa', // orange-200
  },
  'forest-green': {
    name: 'forest-green',
    titleGradient: 'from-emerald-400 to-teal-600',
    titleGradientFrom: '#34d399',
    titleGradientTo: '#0d9488',
    backgroundColor: '#042f2e', // teal-950
    borderColor: '#134e4a', // teal-900
    textColor: '#99f6e4', // teal-200
  },
  'royal-purple': {
    name: 'royal-purple',
    titleGradient: 'from-violet-400 to-purple-600',
    titleGradientFrom: '#a78bfa',
    titleGradientTo: '#9333ea',
    backgroundColor: '#3b0764', // purple-950
    borderColor: '#581c87', // purple-900
    textColor: '#e9d5ff', // purple-200
  },
  'modern-tech': {
    name: 'modern-tech',
    titleGradient: 'from-cyan-400 to-blue-600',
    titleGradientFrom: '#22d3ee',
    titleGradientTo: '#2563eb',
    backgroundColor: '#0c4a6e', // sky-900
    borderColor: '#075985', // sky-800
    textColor: '#bae6fd', // sky-200
  },
  'elegant-rose': {
    name: 'elegant-rose',
    titleGradient: 'from-rose-400 to-pink-600',
    titleGradientFrom: '#fb7185',
    titleGradientTo: '#db2777',
    backgroundColor: '#4c0519', // rose-950
    borderColor: '#881337', // rose-900
    textColor: '#fecdd3', // rose-200
  },
  'corporate-blue': {
    name: 'corporate-blue',
    titleGradient: 'from-blue-500 to-slate-700',
    titleGradientFrom: '#3b82f6',
    titleGradientTo: '#334155',
    backgroundColor: '#020617', // slate-950
    borderColor: '#0f172a', // slate-900
    textColor: '#f1f5f9', // slate-100
  },
  'vibrant-magenta': {
    name: 'vibrant-magenta',
    titleGradient: 'from-fuchsia-400 to-purple-600',
    titleGradientFrom: '#e879f9',
    titleGradientTo: '#9333ea',
    backgroundColor: '#4a044e', // fuchsia-950
    borderColor: '#701a75', // fuchsia-900
    textColor: '#f5d0fe', // fuchsia-200
  },
  'nature-lime': {
    name: 'nature-lime',
    titleGradient: 'from-lime-400 to-green-600',
    titleGradientFrom: '#a3e635',
    titleGradientTo: '#16a34a',
    backgroundColor: '#1a2e05', // lime-950
    borderColor: '#365314', // lime-900
    textColor: '#d9f99d', // lime-200
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

