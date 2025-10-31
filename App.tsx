
import React, { useState, useCallback, useRef } from 'react';
import { Slide, SlideContent } from './types';
import { generateSlideContent, generateImageForSlide } from './services/geminiService';
import SlideGeneratorForm from './components/SlideGeneratorForm';
import SlideViewer from './components/SlideViewer';
import CancelableProgress from './components/CancelableProgress';
import { AppProvider } from './context/AppContext';

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const cancelRef = useRef<boolean>(false);

  const handleGenerateSlides = useCallback(async (script: string) => {
    if (!script.trim()) {
      setError('Por favor, proporciona un script o tema.');
      return;
    }
    
    setIsLoading(true);
    setSlides([]);
    setError(null);
    cancelRef.current = false;
    setProgress(null);

    try {
      setLoadingMessage('Paso 1/2: Diseñando layouts de slides...');
      setProgress({ current: 0, total: 2 });
      
      if (cancelRef.current) {
        setIsLoading(false);
        setLoadingMessage('');
        setProgress(null);
        return;
      }
      
      const slideContents: SlideContent[] = await generateSlideContent(script);

      if (cancelRef.current) {
        setIsLoading(false);
        setLoadingMessage('');
        setProgress(null);
        return;
      }

      if (!slideContents || slideContents.length === 0) {
        throw new Error("No se pudo generar contenido para las slides. El tema podría ser demasiado corto o ambiguo.");
      }

      setLoadingMessage('Paso 2/2: Generando imágenes...');
      const generatedSlides: Slide[] = [];
      const imageSlidesCount = slideContents.filter(s => s.layout === 'text-image' && s.imagePrompt).length;
      const totalSteps = slideContents.length;
      let imagesGenerated = 0;

      for (let i = 0; i < slideContents.length; i++) {
        if (cancelRef.current) {
          setIsLoading(false);
          setLoadingMessage('');
          setProgress(null);
          return;
        }

        const content = slideContents[i];
        const newSlide: Slide = { ...content };

        if (content.layout === 'text-image' && content.imagePrompt) {
          imagesGenerated++;
          setLoadingMessage(`Paso 2/2: Generando imagen ${imagesGenerated} de ${imageSlidesCount}...`);
          setProgress({ current: i + 1, total: totalSteps });
          
          try {
            const detailedImagePrompt = `${content.imagePrompt}, professional presentation slide image, clean background, 16:9 aspect ratio, digital illustration`;
            const imageUrl = await generateImageForSlide(detailedImagePrompt);
            newSlide.imageUrl = imageUrl;
          } catch (imageError) {
            console.warn(`Error generando imagen para slide "${content.title}":`, imageError);
            // Continuar sin imagen si falla
          }
        } else {
          setProgress({ current: i + 1, total: totalSteps });
        }

        generatedSlides.push(newSlide);
      }

      if (!cancelRef.current) {
        setSlides(generatedSlides);
      }

    } catch (err) {
      if (!cancelRef.current) {
        console.error('Error generating slides:', err);
        const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido durante la generación.';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setProgress(null);
    }
  }, []);

  const handleCancel = useCallback(() => {
    cancelRef.current = true;
    setIsLoading(false);
    setLoadingMessage('');
    setProgress(null);
  }, []);
  
  const handleReset = () => {
    setSlides([]);
    setError(null);
  };

  return (
    <AppProvider initialSlides={slides}>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
        {isLoading && (
          <CancelableProgress
            message={loadingMessage}
            progress={progress?.current}
            total={progress?.total}
            onCancel={handleCancel}
          />
        )}
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI Slide Generator
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Convierte tu script en una presentación impresionante en segundos.
        </p>
      </header>

      <main id="main-content" className="w-full flex-grow flex flex-col items-center" role="main" aria-label="Contenido principal">
        {error && (
          <div
            className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 w-full max-w-3xl"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {slides.length === 0 ? (
          <SlideGeneratorForm onGenerate={handleGenerateSlides} isLoading={isLoading} />
        ) : (
          <SlideViewer slides={slides} onReset={handleReset} onSlidesUpdate={setSlides} />
        )}
      </main>

        <footer className="w-full max-w-5xl text-center mt-8 text-gray-500 text-sm">
          <p>Impulsado por Gemini API</p>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;
