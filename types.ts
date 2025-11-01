
export type SlideLayout =
  | 'text-image'       // Texto izquierda, imagen derecha
  | 'image-text'       // Imagen izquierda, texto derecha
  | 'text-only'        // Solo texto
  | 'title-only'       // Solo título
  | 'image-background' // Imagen de fondo con texto encima
  | 'split-vertical';  // Imagen arriba, texto abajo

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

export type ThemeName =
  | 'purple-pink'
  | 'blue-cyan'
  | 'green-emerald'
  | 'orange-red'
  | 'dark-minimal'
  | 'ocean-blue'
  | 'sunset-orange'
  | 'forest-green'
  | 'royal-purple'
  | 'modern-tech'
  | 'elegant-rose'
  | 'corporate-blue'
  | 'vibrant-magenta'
  | 'nature-lime';

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
