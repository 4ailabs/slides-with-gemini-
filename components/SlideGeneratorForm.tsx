
import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface SlideGeneratorFormProps {
  onGenerate: (script: string) => void;
  isLoading: boolean;
}

const SlideGeneratorForm: React.FC<SlideGeneratorFormProps> = ({ onGenerate, isLoading }) => {
  const [script, setScript] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(script);
  };

  return (
    <div
      className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl"
      role="region"
      aria-label="Generador de presentaciones"
    >
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulario de generación de slides">
        <div>
          <label htmlFor="script" className="block text-lg font-medium text-gray-300 mb-2">
            Enter your topic or script
          </label>
          <textarea
            id="script"
            name="script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="e.g., The history of space exploration, from the first rockets to future missions to Mars."
            rows={8}
            className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-gray-200 placeholder-gray-500"
            disabled={isLoading}
            aria-required="true"
            aria-describedby="script-description"
            aria-invalid={!script.trim() && script.length > 0 ? 'true' : 'false'}
          />
          <span id="script-description" className="sr-only">
            Ingresa el tema o script para generar slides de presentación automáticamente
          </span>
        </div>
        <button
          type="submit"
          disabled={isLoading || !script.trim()}
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
              <span>Generate Slides</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SlideGeneratorForm;
