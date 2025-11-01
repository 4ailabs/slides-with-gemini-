
import React, { useState } from 'react';
import { Sparkles, Loader2, Link2, FileText } from 'lucide-react';
import { ThemeName } from '../types';

export type ImageStyle = 'watercolor' | 'realistic' | 'digital-art' | 'minimalist' | '3d-render' | 'sketch' | 'photography' | 'illustration';

interface SlideGeneratorFormProps {
  onGenerate: (script: string, imageStyle?: ImageStyle, theme?: ThemeName) => void;
  onGenerateFromUrl?: (url: string, imageStyle?: ImageStyle, theme?: ThemeName) => void;
  isLoading: boolean;
}

type InputMode = 'text' | 'url';

const IMAGE_STYLES: { value: ImageStyle; label: string; description: string }[] = [
  { value: 'watercolor', label: 'Acuarela', description: 'Pintura suave y artística' },
  { value: 'realistic', label: 'Realista', description: 'Estilo fotográfico real' },
  { value: 'digital-art', label: 'Digital Art', description: 'Arte digital moderno' },
  { value: 'minimalist', label: 'Minimalista', description: 'Líneas simples y limpias' },
  { value: '3d-render', label: '3D Render', description: 'Renderizado 3D profesional' },
  { value: 'sketch', label: 'Sketch/Lápiz', description: 'Dibujo a lápiz' },
  { value: 'photography', label: 'Fotografía', description: 'Foto profesional' },
  { value: 'illustration', label: 'Ilustración', description: 'Ilustración tradicional' },
];

const POPULAR_THEMES: { value: ThemeName; label: string }[] = [
  { value: 'purple-pink', label: 'Morado/Rosa' },
  { value: 'blue-cyan', label: 'Azul/Cyan' },
  { value: 'green-emerald', label: 'Verde/Esmeralda' },
  { value: 'ocean-blue', label: 'Azul Océano' },
  { value: 'sunset-orange', label: 'Naranja/Atardecer' },
  { value: 'royal-purple', label: 'Morado Real' },
  { value: 'modern-tech', label: 'Tech Moderno' },
  { value: 'elegant-rose', label: 'Rosa Elegante' },
  { value: 'corporate-blue', label: 'Azul Corporativo' },
];

const SlideGeneratorForm: React.FC<SlideGeneratorFormProps> = ({ onGenerate, onGenerateFromUrl, isLoading }) => {
  const [script, setScript] = useState('');
  const [url, setUrl] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [imageStyle, setImageStyle] = useState<ImageStyle>('realistic');
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('purple-pink');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'text') {
      onGenerate(script, imageStyle, selectedTheme);
    } else if (inputMode === 'url' && onGenerateFromUrl) {
      onGenerateFromUrl(url, imageStyle, selectedTheme);
    }
  };

  const isSubmitDisabled = isLoading || (inputMode === 'text' ? !script.trim() : !url.trim());

  return (
    <div
      className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl"
      role="region"
      aria-label="Generador de presentaciones"
    >
      {/* Tabs para seleccionar modo de entrada */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          type="button"
          onClick={() => setInputMode('text')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            inputMode === 'text'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          disabled={isLoading}
        >
          <FileText className="w-4 h-4" />
          Texto
        </button>
        {onGenerateFromUrl && (
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              inputMode === 'url'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            disabled={isLoading}
          >
            <Link2 className="w-4 h-4" />
            URL
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de generación de slides">
        {inputMode === 'text' ? (
          <div>
            <label htmlFor="script" className="block text-lg font-medium text-gray-300 mb-2">
              Ingresa tu tema o script
            </label>
            <textarea
              id="script"
              name="script"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Ej: La historia de la exploración espacial, desde los primeros cohetes hasta las futuras misiones a Marte."
              rows={8}
              className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-gray-200 placeholder-gray-500"
              disabled={isLoading}
              aria-required="true"
              aria-describedby="script-description"
            />
            <span id="script-description" className="sr-only">
              Ingresa el tema o script para generar slides de presentación automáticamente
            </span>
          </div>
        ) : (
          <div>
            <label htmlFor="url" className="block text-lg font-medium text-gray-300 mb-2">
              Ingresa la URL del artículo o página web
            </label>
            <input
              id="url"
              name="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/articulo"
              className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-gray-200 placeholder-gray-500"
              disabled={isLoading}
              aria-required="true"
              aria-describedby="url-description"
            />
            <span id="url-description" className="text-sm text-gray-400 mt-2 block">
              Se extraerá el contenido de la página para generar las slides
            </span>
          </div>
        )}
        
        {/* Selector de tema de colores */}
        <div>
          <label htmlFor="slideTheme" className="block text-lg font-medium text-gray-300 mb-2">
            Tema de la Presentación
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {POPULAR_THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => setSelectedTheme(theme.value)}
                disabled={isLoading}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedTheme === theme.value
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-semibold text-white text-sm">{theme.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de estilo de imagen */}
        <div>
          <label htmlFor="imageStyle" className="block text-lg font-medium text-gray-300 mb-2">
            Estilo de las Imágenes
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {IMAGE_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setImageStyle(style.value)}
                disabled={isLoading}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  imageStyle === style.value
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-semibold text-white text-sm mb-1">{style.label}</div>
                <div className="text-xs text-gray-400">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 gap-2"
          aria-label={isLoading ? 'Generando slides, por favor espera' : 'Generar slides'}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span aria-live="polite">Generando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generar Slides</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SlideGeneratorForm;
