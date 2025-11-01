
import React, { useState, useCallback, useRef } from 'react';
import { Slide, SlideContent } from './types';
import { generateSlideContent, generateImageForSlide } from './services/geminiService';
import { extractContentFromUrl } from './services/urlContentService';
import SlideGeneratorForm from './components/SlideGeneratorForm';
import SlideViewer from './components/SlideViewer';
import CancelableProgress from './components/CancelableProgress';
import ProposalPreview from './components/ProposalPreview';
import { AppProvider } from './context/AppContext';

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [proposal, setProposal] = useState<SlideContent[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const cancelRef = useRef<boolean>(false);

  const handleGenerateProposal = useCallback(async (script: string) => {
    if (!script.trim()) {
      setError('Por favor, proporciona un script o tema.');
      return;
    }
    
    setIsLoading(true);
    setProposal(null);
    setError(null);
    cancelRef.current = false;
    setProgress(null);

    try {
      setLoadingMessage('Generando propuesta de slides...');
      setProgress({ current: 0, total: 1 });
      
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

      if (!cancelRef.current) {
        setProposal(slideContents);
      }

    } catch (err) {
      if (!cancelRef.current) {
        console.error('Error generating proposal:', err);
        const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido durante la generación.';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setProgress(null);
    }
  }, []);

  const handleGenerateFromUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError('Por favor, proporciona una URL válida.');
      return;
    }

    setIsLoading(true);
    setProposal(null);
    setError(null);
    cancelRef.current = false;
    setProgress(null);

    try {
      setLoadingMessage('Extrayendo contenido de la URL...');
      setProgress({ current: 0, total: 2 });

      if (cancelRef.current) {
        setIsLoading(false);
        setLoadingMessage('');
        setProgress(null);
        return;
      }

      // Extraer contenido de la URL
      const urlContent = await extractContentFromUrl(url);

      if (cancelRef.current) {
        setIsLoading(false);
        setLoadingMessage('');
        setProgress(null);
        return;
      }

      // Usar el contenido extraído para generar la propuesta
      setLoadingMessage('Generando propuesta de slides...');
      setProgress({ current: 1, total: 2 });

      const contentToGenerate = urlContent.title
        ? `${urlContent.title}\n\n${urlContent.content}`
        : urlContent.content;

      const slideContents: SlideContent[] = await generateSlideContent(contentToGenerate);

      if (cancelRef.current) {
        setIsLoading(false);
        setLoadingMessage('');
        setProgress(null);
        return;
      }

      if (!slideContents || slideContents.length === 0) {
        throw new Error("No se pudo generar contenido para las slides.");
      }

      if (!cancelRef.current) {
        setProposal(slideContents);
      }

    } catch (err) {
      if (!cancelRef.current) {
        console.error('Error generating from URL:', err);
        const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error al procesar la URL.';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setProgress(null);
    }
  }, []);

  const handleApproveProposal = useCallback(async (editedProposal: SlideContent[]) => {
    if (!editedProposal || editedProposal.length === 0) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Generando slides con imágenes...');
    cancelRef.current = false;
    
    const slidesWithImages: Slide[] = [];
    const imageSlidesCount = editedProposal.filter(s => s.layout === 'text-image' && s.imagePrompt).length;
    const totalSteps = editedProposal.length;
    let imagesGenerated = 0;
    
    try {
      for (let i = 0; i < editedProposal.length; i++) {
        if (cancelRef.current) {
          setIsLoading(false);
          setLoadingMessage('');
          setProgress(null);
          return;
        }

        const content = editedProposal[i];
        if (!content || !content.title || !content.layout || !content.content) {
          continue;
        }
        const newSlide: Slide = { ...content };

        if (content.layout === 'text-image' && content.imagePrompt) {
          imagesGenerated++;
          setLoadingMessage(`Generando imagen ${imagesGenerated} de ${imageSlidesCount}...`);
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

        slidesWithImages.push(newSlide);
      }

      if (!cancelRef.current) {
        setSlides(slidesWithImages);
        setProposal(null);
      }
    } catch (err) {
      if (!cancelRef.current) {
        console.error('Error generating slides:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error al generar las slides.';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setProgress(null);
    }
  }, []);

  const handleRejectProposal = useCallback(() => {
    setProposal(null);
    setError(null);
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

        {slides.length === 0 && !proposal ? (
          <SlideGeneratorForm
            onGenerate={handleGenerateProposal}
            onGenerateFromUrl={handleGenerateFromUrl}
            isLoading={isLoading}
          />
        ) : proposal ? (
          <ProposalPreview
            proposal={proposal}
            onApprove={handleApproveProposal}
            onReject={handleRejectProposal}
            isLoading={isLoading}
          />
        ) : (
          <SlideViewer 
            slides={slides} 
            onReset={handleReset} 
            onSlidesUpdate={setSlides}
            onGenerateImages={async (slidesToUpdate) => {
              setIsLoading(true);
              setLoadingMessage('Generando imágenes...');
              cancelRef.current = false;
              
              const slidesWithImages: Slide[] = [];
              const imageSlidesCount = slidesToUpdate.filter(s => s.layout === 'text-image' && s.imagePrompt && !s.imageUrl).length;
              
              if (imageSlidesCount === 0) {
                setIsLoading(false);
                setLoadingMessage('');
                setProgress(null);
                return;
              }
              
              let imagesGenerated = 0;
              
              try {
                for (let i = 0; i < slidesToUpdate.length; i++) {
                  if (cancelRef.current) {
                    setIsLoading(false);
                    setLoadingMessage('');
                    setProgress(null);
                    return;
                  }

                  const slide = slidesToUpdate[i];
                  if (!slide) {
                    continue;
                  }
                  
                  const updatedSlide: Slide = { ...slide };

                  if (slide.layout === 'text-image' && slide.imagePrompt && !slide.imageUrl) {
                    imagesGenerated++;
                    setLoadingMessage(`Generando imagen ${imagesGenerated} de ${imageSlidesCount}...`);
                    setProgress({ current: imagesGenerated, total: imageSlidesCount });
                    
                    try {
                      const detailedImagePrompt = `${slide.imagePrompt}, professional presentation slide image, clean background, 16:9 aspect ratio, digital illustration`;
                      const imageUrl = await generateImageForSlide(detailedImagePrompt);
                      updatedSlide.imageUrl = imageUrl;
                    } catch (imageError) {
                      console.warn(`Error generando imagen para slide "${slide.title}":`, imageError);
                      // Continuar sin imagen si falla
                    }
                  }

                  slidesWithImages.push(updatedSlide);
                }

                if (!cancelRef.current) {
                  setSlides(slidesWithImages);
                }
              } catch (err) {
                if (!cancelRef.current) {
                  console.error('Error generating images:', err);
                  const errorMessage = err instanceof Error ? err.message : 'Error al generar imágenes.';
                  setError(errorMessage);
                }
              } finally {
                setIsLoading(false);
                setLoadingMessage('');
                setProgress(null);
              }
            }}
          />
        )}
      </main>

        <footer className="w-full max-w-5xl text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Gemini API | Developed by 4 ailabs</p>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;
