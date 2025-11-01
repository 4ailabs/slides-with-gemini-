
import React, { memo } from 'react';
import { Slide as SlideType, ThemeName, FontSettings, ContentPoint } from '../types';
import { themes, defaultFontSettings, fontSizes } from '../constants/themes';
import LazyImage from './LazyImage';
import { ArrowUp, ArrowDown, X, Plus, ImageIcon } from 'lucide-react';
import { getIconComponent } from '../utils/iconRenderer';

interface SlideProps {
  slide: SlideType;
  theme?: ThemeName;
  fontSettings?: FontSettings;
  isEditable?: boolean;
  isCapture?: boolean; // Indica si está siendo capturado para exportación
  onTitleChange?: (title: string) => void;
  onContentChange?: (index: number, content: string) => void;
  onIconChange?: (index: number, iconName: string | undefined) => void;
  onAddContent?: () => void;
  onRemoveContent?: (index: number) => void;
  onMoveContentUp?: (index: number) => void;
  onMoveContentDown?: (index: number) => void;
}

const Slide: React.FC<SlideProps> = ({
  slide,
  theme = 'purple-pink',
  fontSettings = defaultFontSettings,
  isEditable = false,
  isCapture = false,
  onTitleChange,
  onContentChange,
  onIconChange,
  onAddContent,
  onRemoveContent,
  onMoveContentUp,
  onMoveContentDown,
}) => {
  // Validación defensiva
  if (!slide || !slide.title) {
    return null;
  }

  const currentTheme = themes[theme] || themes['purple-pink'];
  const titleSizeClass = fontSizes.title[fontSettings.titleSize];
  const contentSizeClass = fontSizes.content[fontSettings.contentSize];
  const layout = slide.layout || 'text-image';

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

    // Para captura, usar color sólido en lugar de gradiente (mejor compatibilidad con html2canvas)
    // Y no usar line-clamp para evitar cortes
    if (isCapture) {
      return (
        <h2
          className={`font-bold ${className} break-words`}
          style={{
            color: currentTheme.titleGradientFrom,
            fontFamily: fontSettings.fontFamily,
            lineHeight: '1.2',
          }}
        >
          {slide.title}
        </h2>
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
    const content = slide.content || [];
    
    // Normalizar contenido a ContentPoint[]
    const normalizedContent: ContentPoint[] = content.map(point => {
      if (typeof point === 'string') {
        return { text: point };
      }
      return point;
    });

    const getThemeIconColor = () => {
      const themeColors: Record<string, string> = {
        'purple-pink': '#c084fc',
        'blue-cyan': '#22d3ee',
        'green-emerald': '#34d399',
        'orange-red': '#fb923c',
        'dark-minimal': '#ffffff',
      };
      return themeColors[theme] || themeColors['purple-pink'];
    };

    const iconColor = getThemeIconColor();
    
    if (isEditable) {
      return (
        <div className="space-y-3">
          {normalizedContent.map((point, index) => {
            const IconComponent = point.icon ? getIconComponent(point.icon) : null;
            return (
              <div key={index} className="flex items-start gap-2 group">
                <div className="flex flex-col gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onMoveContentUp && index > 0 && (
                    <button
                      onClick={() => onMoveContentUp(index)}
                      className="text-gray-400 hover:text-white p-1"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}
                  {onMoveContentDown && index < normalizedContent.length - 1 && (
                    <button
                      onClick={() => onMoveContentDown(index)}
                      className="text-gray-400 hover:text-white p-1"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  )}
                  {index === 0 && index === normalizedContent.length - 1 && (
                    <div className="h-8"></div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {IconComponent ? (
                    <div className="flex items-center gap-1">
                      <IconComponent style={{ fontSize: '1.25rem', color: iconColor }} />
                      {onIconChange && (
                        <button
                          onClick={() => onIconChange(index, undefined)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white text-xs"
                          title="Quitar icono"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    onIconChange && (
                      <button
                        onClick={() => {
                          // Esto se manejará en SlideViewer para abrir el picker
                          onIconChange(index, '');
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1"
                        title="Agregar icono"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
                <textarea
                  value={point.text}
                  onChange={(e) => onContentChange?.(index, e.target.value)}
                  className={`flex-1 bg-transparent border-2 border-dashed border-white/30 rounded px-2 py-1 resize-none ${contentSizeClass} break-words`}
                  style={{
                    color: currentTheme.textColor,
                    fontFamily: fontSettings.fontFamily,
                  }}
                  rows={2}
                />
                <div className="flex flex-col gap-1">
                  {onRemoveContent && (
                    <button
                      onClick={() => onRemoveContent(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Eliminar punto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {onAddContent && (
            <button
              onClick={onAddContent}
              className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 border border-dashed border-blue-400/50 rounded flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Agregar punto
            </button>
          )}
        </div>
      );
    }
    
    return (
      <ul className={`space-y-3 ${contentSizeClass}`} style={{ color: currentTheme.textColor, fontFamily: fontSettings.fontFamily }}>
        {normalizedContent.map((point, index) => {
          const IconComponent = point.icon ? getIconComponent(point.icon) : null;
          return (
            <li key={index} className="flex items-start gap-3 break-words">
              {IconComponent ? (
                <span className="flex-shrink-0 mt-1">
                  <IconComponent style={{ fontSize: '1.5rem', color: iconColor }} />
                </span>
              ) : (
                <span className="text-gray-400 mt-1">•</span>
              )}
              <span className="flex-1">{point.text}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  const baseContainerClasses = `w-full aspect-video rounded-lg shadow-2xl overflow-hidden flex border`;

  const containerStyle: React.CSSProperties = {
    backgroundColor: currentTheme.backgroundColor,
    borderColor: currentTheme.borderColor,
    fontFamily: fontSettings.fontFamily,
  };

  switch (layout) {
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
          <div className="flex-shrink-0 mb-6 lg:mb-8 w-full">
            <Title className={titleSizeClass} maxLines={2} />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto w-full">
            <Content />
          </div>
        </div>
      );

    case 'image-text':
      // Layout inverso: Imagen izquierda, texto derecha
      if (!slide.imageUrl) {
        // Si no hay imagen, mostrar texto centrado
        return (
          <div
            className={`${baseContainerClasses} flex-col justify-center items-center text-center p-8 lg:p-12`}
            style={containerStyle}
          >
            <div className="w-full max-w-4xl px-4">
              <div className="mb-6 lg:mb-8">
                <Title className={titleSizeClass} maxLines={3} />
              </div>
              <div className="flex justify-center">
                <div className="text-left max-w-2xl">
                  <Content />
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={baseContainerClasses} style={containerStyle}>
          <div className="w-1/2 h-full bg-black flex-shrink-0">
            {isCapture ? (
              <img
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <LazyImage
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="w-1/2 h-full flex flex-col p-8 lg:p-12 min-h-0 overflow-hidden" style={{ color: currentTheme.textColor }}>
            <div className="flex-shrink-0 mb-6 lg:mb-8">
              <Title className={titleSizeClass} maxLines={2} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Content />
            </div>
          </div>
        </div>
      );

    case 'split-vertical':
      // Imagen arriba, texto abajo
      if (!slide.imageUrl) {
        // Si no hay imagen, mostrar solo texto centrado
        return (
          <div
            className={`${baseContainerClasses} flex-col justify-center items-center text-center p-8 lg:p-12`}
            style={containerStyle}
          >
            <div className="w-full max-w-4xl px-4">
              <div className="mb-6 lg:mb-8">
                <Title className={titleSizeClass} maxLines={3} />
              </div>
              <div className="flex justify-center">
                <div className="text-left max-w-2xl">
                  <Content />
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={`${baseContainerClasses} flex-col`} style={containerStyle}>
          <div className="w-full h-1/2 bg-black flex-shrink-0">
            {isCapture ? (
              <img
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <LazyImage
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="w-full h-1/2 flex flex-col p-6 lg:p-8 min-h-0 overflow-hidden" style={{ color: currentTheme.textColor }}>
            <div className="flex-shrink-0 mb-4 lg:mb-6">
              <Title className={titleSizeClass} maxLines={2} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Content />
            </div>
          </div>
        </div>
      );

    case 'image-background':
      // Imagen de fondo con texto encima
      if (!slide.imageUrl) {
        // Si no hay imagen, usar fondo oscuro con gradiente
        return (
          <div
            className={`${baseContainerClasses} flex-col justify-center items-center text-center p-8 lg:p-12`}
            style={{
              ...containerStyle,
              background: `linear-gradient(135deg, ${currentTheme.backgroundColor} 0%, ${currentTheme.borderColor} 100%)`,
            }}
          >
            <div className="w-full max-w-4xl px-4 bg-black/40 backdrop-blur-sm rounded-2xl p-8">
              <div className="mb-6 lg:mb-8">
                <Title className={titleSizeClass} maxLines={3} />
              </div>
              <div className="flex justify-center">
                <div className="text-left max-w-2xl">
                  <Content />
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={`${baseContainerClasses} relative`} style={containerStyle}>
          {/* Imagen de fondo */}
          <div className="absolute inset-0 w-full h-full">
            {isCapture ? (
              <img
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <LazyImage
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay oscuro para mejor legibilidad */}
            <div className="absolute inset-0 bg-black/50" />
          </div>
          {/* Contenido encima de la imagen */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center p-8 lg:p-12">
            <div className="w-full max-w-4xl px-4 bg-black/40 backdrop-blur-sm rounded-2xl p-6 lg:p-8" style={{ color: currentTheme.textColor }}>
              <div className="mb-6 lg:mb-8">
                <Title className={titleSizeClass} maxLines={3} />
              </div>
              <div className="flex justify-center">
                <div className="text-left max-w-2xl">
                  <Content />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'text-image':
    default:
      // Si no hay imagen, mostrar texto centrado en toda la diapositiva
      if (!slide.imageUrl) {
        return (
          <div
            className={`${baseContainerClasses} flex-col justify-center items-center text-center p-8 lg:p-12`}
            style={containerStyle}
          >
            <div className="w-full max-w-4xl px-4">
              <div className="mb-6 lg:mb-8">
                <Title className={titleSizeClass} maxLines={3} />
              </div>
              <div className="flex justify-center">
                <div className="text-left max-w-2xl">
                  <Content />
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Si hay imagen, layout normal con texto a la izquierda e imagen a la derecha
      return (
        <div className={baseContainerClasses} style={containerStyle}>
          <div className="w-1/2 h-full flex flex-col p-8 lg:p-12 min-h-0 overflow-hidden" style={{ color: currentTheme.textColor }}>
            <div className="flex-shrink-0 mb-6 lg:mb-8">
              <Title className={titleSizeClass} maxLines={2} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Content />
            </div>
          </div>
          <div className="w-1/2 h-full bg-black flex-shrink-0">
            {isCapture ? (
              // Usar img directa para captura (LazyImage no funciona fuera del viewport)
              <img
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <LazyImage
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      );
  }
};

export default memo(Slide);
