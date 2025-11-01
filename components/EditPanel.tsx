import React, { useState } from 'react';
import { ThemeName, SlideLayout, FontSettings } from '../types';
import { themes, fontFamilies } from '../constants/themes';
import ThemePreview from './ThemePreview';
import ImageUploader from './ImageUploader';
import { X } from 'lucide-react';

interface EditPanelProps {
  currentLayout: SlideLayout;
  currentTheme: ThemeName;
  fontSettings: FontSettings;
  currentImageUrl?: string;
  onLayoutChange: (layout: SlideLayout) => void;
  onThemeChange: (theme: ThemeName) => void;
  onFontSettingsChange: (settings: FontSettings) => void;
  onImageChange?: (imageUrl: string) => void;
  onRegenerateImage?: () => void;
  onRemoveImage?: () => void;
  isRegeneratingImage?: boolean;
  onClose: () => void;
}

const EditPanel: React.FC<EditPanelProps> = ({
  currentLayout,
  currentTheme,
  fontSettings,
  currentImageUrl,
  onLayoutChange,
  onThemeChange,
  onFontSettingsChange,
  onImageChange,
  onRegenerateImage,
  onRemoveImage,
  isRegeneratingImage,
  onClose,
}) => {
  const [previewTheme, setPreviewTheme] = useState<ThemeName>(currentTheme);
  const layouts: { value: SlideLayout; label: string; description: string }[] = [
    { value: 'text-image', label: 'Texto + Imagen', description: 'Texto izq., imagen der.' },
    { value: 'image-text', label: 'Imagen + Texto', description: 'Imagen izq., texto der.' },
    { value: 'split-vertical', label: 'División Vertical', description: 'Imagen arriba, texto abajo' },
    { value: 'image-background', label: 'Fondo con Imagen', description: 'Imagen de fondo con texto' },
    { value: 'text-only', label: 'Solo Texto', description: 'Sin imagen' },
    { value: 'title-only', label: 'Solo Título', description: 'Sin contenido' },
  ];

  // Determinar si el layout actual soporta imágenes
  const layoutSupportsImages = ['text-image', 'image-text', 'split-vertical', 'image-background'].includes(currentLayout);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Personalizar Slide</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selector de Layout */}
          <div>
            <label className="block text-white font-semibold mb-3">Layout</label>
            <div className="grid grid-cols-2 gap-3">
              {layouts.map((layout) => (
                <button
                  key={layout.value}
                  onClick={() => onLayoutChange(layout.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    currentLayout === layout.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-white text-sm font-medium mb-1">{layout.label}</div>
                  <div className="text-gray-400 text-xs">{layout.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor de Imagen - Solo mostrar para layouts que soportan imágenes */}
          {layoutSupportsImages && (
            <div>
              <label className="block text-white font-semibold mb-3">Imagen de la Slide</label>
              <ImageUploader
                currentImageUrl={currentImageUrl}
                onImageChange={onImageChange || (() => {})}
                onRegenerateImage={onRegenerateImage}
                onRemoveImage={onRemoveImage}
                isRegenerating={isRegeneratingImage}
              />
            </div>
          )}

          {/* Selector de Tema */}
          <div>
            <label className="block text-white font-semibold mb-3">Tema de Colores</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(themes).map(([key]) => (
                <ThemePreview
                  key={key}
                  theme={key as ThemeName}
                  isSelected={previewTheme === key}
                  onSelect={() => {
                    setPreviewTheme(key as ThemeName);
                    onThemeChange(key as ThemeName);
                  }}
                />
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-2">Preview: el tema se aplicará inmediatamente</p>
          </div>

          {/* Tamaño de Título */}
          <div>
            <label className="block text-white font-semibold mb-3">Tamaño del Título</label>
            <select
              value={fontSettings.titleSize}
              onChange={(e) =>
                onFontSettingsChange({
                  ...fontSettings,
                  titleSize: e.target.value as FontSettings['titleSize'],
                })
              }
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
              <option value="xlarge">Extra Grande</option>
            </select>
          </div>

          {/* Tamaño de Contenido */}
          <div>
            <label className="block text-white font-semibold mb-3">Tamaño del Contenido</label>
            <select
              value={fontSettings.contentSize}
              onChange={(e) =>
                onFontSettingsChange({
                  ...fontSettings,
                  contentSize: e.target.value as FontSettings['contentSize'],
                })
              }
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>

          {/* Fuente */}
          <div>
            <label className="block text-white font-semibold mb-3">Fuente</label>
            <select
              value={fontSettings.fontFamily}
              onChange={(e) =>
                onFontSettingsChange({
                  ...fontSettings,
                  fontFamily: e.target.value,
                })
              }
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
              style={{ fontFamily: fontSettings.fontFamily }}
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPanel;

