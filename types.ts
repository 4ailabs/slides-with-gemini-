
export type SlideLayout = 'text-image' | 'text-only' | 'title-only';

export interface ContentPoint {
  text: string;
  icon?: string; // Nombre del icono de la librería (ej: "FiStar", "LuHeart")
}

export interface SlideContent {
  title: string;
  content: string[] | ContentPoint[]; // Soporte para ambos formatos (backward compatible)
  layout: SlideLayout;
  imagePrompt?: string;
}

export interface Slide extends SlideContent {
  imageUrl?: string;
}

export type ThemeName = 'purple-pink' | 'blue-cyan' | 'green-emerald' | 'orange-red' | 'dark-minimal';

export interface Theme {
  name: ThemeName;
  titleGradient: string;
  titleGradientFrom: string;
  titleGradientTo: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export interface FontSettings {
  titleSize: 'small' | 'medium' | 'large' | 'xlarge';
  contentSize: 'small' | 'medium' | 'large';
  fontFamily: string;
}

export interface PresentationSettings {
  theme: ThemeName;
  fontSettings: FontSettings;
}
