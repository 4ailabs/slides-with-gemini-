
import React, { memo } from 'react';
import { Slide as SlideType, ThemeName, FontSettings } from '../types';
import { themes, defaultFontSettings, fontSizes } from '../constants/themes';
import LazyImage from './LazyImage';

interface SlideProps {
  slide: SlideType;
  theme?: ThemeName;
  fontSettings?: FontSettings;
  isEditable?: boolean;
  onTitleChange?: (title: string) => void;
  onContentChange?: (index: number, content: string) => void;
  onAddContent?: () => void;
  onRemoveContent?: (index: number) => void;
}

const Slide: React.FC<SlideProps> = ({ 
  slide, 
  theme = 'purple-pink',
  fontSettings = defaultFontSettings,
  isEditable = false,
  onTitleChange,
  onContentChange,
  onAddContent,
  onRemoveContent,
}) => {
  const currentTheme = themes[theme] || themes['purple-pink'];
  const titleSizeClass = fontSizes.title[fontSettings.titleSize];
  const contentSizeClass = fontSizes.content[fontSettings.contentSize];

  const Title = ({ className = '', maxLines = 2 }: { className?: string; maxLines?: number }) => {
    if (isEditable && onTitleChange) {
      return (
        <input
          type="text"
          value={slide.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="font-bold bg-transparent border-2 border-dashed border-white/30 rounded px-2 py-1 w-full break-words"
          style={{
            color: currentTheme.titleGradientFrom,
            fontSize: 'inherit',
            fontFamily: fontSettings.fontFamily,
          }}
        />
      );
    }
    return (
      <h2 
        className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.titleGradient} ${className} break-words`}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          fontFamily: fontSettings.fontFamily,
        }}
      >
        {slide.title}
      </h2>
    );
  };
  
  const Content = () => {
    if (isEditable) {
      return (
        <div className="space-y-3">
          {slide.content.map((point, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <textarea
                value={point}
                onChange={(e) => onContentChange?.(index, e.target.value)}
                className={`flex-1 bg-transparent border-2 border-dashed border-white/30 rounded px-2 py-1 resize-none ${contentSizeClass} break-words`}
                style={{
                  color: currentTheme.textColor,
                  fontFamily: fontSettings.fontFamily,
                }}
                rows={2}
              />
              {onRemoveContent && (
                <button
                  onClick={() => onRemoveContent(index)}
                  className="text-red-400 hover:text-red-300 px-2"
                  title="Eliminar punto"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {onAddContent && (
            <button
              onClick={onAddContent}
              className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 border border-dashed border-blue-400/50 rounded"
            >
              + Agregar punto
            </button>
          )}
        </div>
      );
    }
    
    return (
      <ul className={`space-y-3 list-disc list-inside ${contentSizeClass}`} style={{ color: currentTheme.textColor, fontFamily: fontSettings.fontFamily }}>
        {slide.content.map((point, index) => (
          <li key={index} className="break-words">{point}</li>
        ))}
      </ul>
    );
  };

  const baseContainerClasses = `w-full aspect-video rounded-lg shadow-2xl overflow-hidden flex border`;

  const containerStyle = {
    backgroundColor: currentTheme.backgroundColor,
    borderColor: currentTheme.borderColor,
    fontFamily: fontSettings.fontFamily,
  };

  switch (slide.layout) {
    case 'title-only':
      return (
        <div 
          className={`${baseContainerClasses} flex-col justify-center items-center text-center p-8 lg:p-12`}
          style={containerStyle}
        >
          <div className="w-full px-4">
            <Title className={titleSizeClass} maxLines={3} />
          </div>
        </div>
      );

    case 'text-only':
      return (
        <div 
          className={`${baseContainerClasses} flex-col p-8 lg:p-12 min-h-0`}
          style={containerStyle}
        >
          <div className="flex-shrink-0 mb-4 lg:mb-6 w-full">
            <Title className={titleSizeClass} maxLines={2} />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto w-full">
            <Content />
          </div>
        </div>
      );
      
    case 'text-image':
    default:
      return (
        <div className={baseContainerClasses} style={containerStyle}>
          <div className="w-1/2 h-full flex flex-col p-8 lg:p-12 min-h-0 overflow-hidden" style={{ color: currentTheme.textColor }}>
            <div className="flex-shrink-0 mb-4">
              <Title className={titleSizeClass} maxLines={2} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Content />
            </div>
          </div>
          <div className="w-1/2 h-full bg-black flex-shrink-0">
            {slide.imageUrl ? (
              <LazyImage
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <p className="text-gray-400">Image not generated</p>
              </div>
            )}
          </div>
        </div>
      );
  }
};

export default memo(Slide);
