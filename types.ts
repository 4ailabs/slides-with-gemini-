
export type SlideLayout = 'text-image' | 'text-only' | 'title-only';

export interface SlideContent {
  title: string;
  content: string[];
  layout: SlideLayout;
  imagePrompt?: string;
}

export interface Slide extends SlideContent {
  imageUrl?: string;
}
