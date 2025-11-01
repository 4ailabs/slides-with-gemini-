
import React, { useState, useCallback, useRef } from 'react';
import { Slide, SlideContent, ThemeName, SlideLayout } from './types';
import { generateSlideContent, generateImageForSlide } from './services/geminiService';
import { extractContentFromUrl } from './services/urlContentService';
import SlideGeneratorForm, { ImageStyle } from './components/SlideGeneratorForm';
import SlideViewer from './components/SlideViewer';
import CancelableProgress from './components/CancelableProgress';
import ProposalPreview from './components/ProposalPreview';
import { AppProvider } from './context/AppContext';
import { loadAllPresentations, SavedPresentation } from './services/storageService';
import { loadHistory, HistorySnapshot } from './services/historyService';
import { FolderOpen, X } from 'lucide-react';
import { themes } from './constants/themes';

// Helper function to check if a layout supports images
const layoutSupportsImages = (layout: SlideLayout): boolean => {
  return ['text-image', 'image-text', 'split-vertical', 'image-background'].includes(layout);
};

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [proposal, setProposal] = useState<SlideContent[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [showWelcomeLoadDialog, setShowWelcomeLoadDialog] = useState(false);
  const [loadDialogTab, setLoadDialogTab] = useState<'saved' | 'history'>('saved');
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const [historySnapshots, setHistorySnapshots] = useState<HistorySnapshot[]>([]);
  const [currentImageStyle, setCurrentImageStyle] = useState<ImageStyle>('realistic');
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('purple-pink');
  const cancelRef = useRef<boolean>(false);

  // Map de estilos a descripciones para prompts
  const getStylePrompt = (style: ImageStyle): string => {
    const styleMap: Record<ImageStyle, string> = {
      'watercolor': 'watercolor painting style, soft colors, artistic brushstrokes',
      'realistic': 'realistic photography style, high detail, professional lighting',
      'digital-art': 'digital art style, modern design, vibrant colors',
      'minimalist': 'minimalist style, clean lines, simple composition',
      '3d-render': '3D render style, computer graphics, volumetric lighting',
      'sketch': 'pencil sketch style, hand-drawn illustration, black and white',
      'photography': 'photography style, natural lighting, real-world subject',
      'illustration': 'illustration style, traditional art, expressive',
    };
    return styleMap[style] || styleMap['realistic'];
  };

  // Map de temas a paletas de colores para prompts
  const getThemeColorPrompt = (themeName: ThemeName): string => {
    const theme = themes[themeName];
    if (!theme) return '';
    
    const colorNames: Record<string, string> = {
      // purple-pink
      '#c084fc': 'purple',
      '#ec4899': 'pink',
      // blue-cyan
      '#93c5fd': 'blue',
      '#06b6d4': 'cyan',
      // green-emerald
      '#86efac': 'green',
      '#10b981': 'emerald',
      // orange-red
      '#fdba74': 'orange',
      '#ef4444': 'red',
      // gray
      '#e5e7eb': 'light gray',
      '#9ca3af': 'gray',
      '#1f2937': 'dark gray',
      // ocean-blue
      '#60a5fa': 'ocean blue',
      '#4f46e5': 'indigo',
      // sunset-orange
      '#facc15': 'yellow',
      '#ea580c': 'orange',
      // forest-green
      '#34d399': 'emerald',
      '#0d9488': 'teal',
      // royal-purple
      '#a78bfa': 'violet',
      '#9333ea': 'purple',
      // modern-tech
      '#22d3ee': 'cyan',
      '#2563eb': 'blue',
      // elegant-rose
      '#fb7185': 'rose',
      '#db2777': 'pink',
      // corporate-blue
      '#3b82f6': 'corporate blue',
      '#334155': 'slate gray',
      // vibrant-magenta
      '#e879f9': 'magenta',
      // nature-lime
      '#a3e635': 'lime',
      '#16a34a': 'green',
    };
    
    const fromColor = colorNames[theme.titleGradientFrom] || 'primary';
    const toColor = colorNames[theme.titleGradientTo] || 'secondary';
    
    return `${fromColor} and ${toColor} color palette, harmonious color scheme`;
  };

  const buildImagePrompt = (basePrompt: string, theme?: ThemeName): string => {
    const stylePrompt = getStylePrompt(currentImageStyle);
    const themePrompt = theme ? getThemeColorPrompt(theme) : '';
    const combinedPrompts = [basePrompt, stylePrompt, themePrompt].filter(Boolean).join(', ');
    return `${combinedPrompts}, professional presentation slide image, clean background, 16:9 aspect ratio, no text, no words, no letters`;
  };

  const handleGenerateProposal = useCallback(async (script: string, imageStyle?: ImageStyle, theme?: ThemeName) => {
    if (imageStyle) setCurrentImageStyle(imageStyle);
    if (theme) setCurrentTheme(theme);
    if (!script.trim()) {
      setError('Por favor, proporciona un script o tema.');
      return;
    }
    
    setIsLoading(true);
    setProposal(null);
    setSlides([]); // Limpiar slides anteriores
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

  const handleGenerateFromUrl = useCallback(async (url: string, imageStyle?: ImageStyle, theme?: ThemeName) => {
    if (imageStyle) setCurrentImageStyle(imageStyle);
    if (theme) setCurrentTheme(theme);
    if (!url.trim()) {
      setError('Por favor, proporciona una URL válida.');
      return;
    }

    setIsLoading(true);
    setProposal(null);
    setSlides([]); // Limpiar slides anteriores
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
    const imageSlidesCount = editedProposal.filter(s => layoutSupportsImages(s.layout) && s.imagePrompt).length;
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

        if (layoutSupportsImages(content.layout) && content.imagePrompt) {
          imagesGenerated++;
          setLoadingMessage(`Generando imagen ${imagesGenerated} de ${imageSlidesCount}...`);
          setProgress({ current: i + 1, total: totalSteps });
          
          try {
            const detailedImagePrompt = buildImagePrompt(content.imagePrompt, currentTheme);
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

  const handleOpenLoadDialog = () => {
    setSavedPresentations(loadAllPresentations());
    setHistorySnapshots(loadHistory().sort((a, b) => b.timestamp - a.timestamp));
    setShowWelcomeLoadDialog(true);
  };

  const handleLoadPresentation = (presentation: SavedPresentation) => {
    setSlides(presentation.slides);
    setShowWelcomeLoadDialog(false);
  };

  const handleLoadHistorySnapshot = (snapshot: HistorySnapshot) => {
    setSlides(snapshot.slides);
    setShowWelcomeLoadDialog(false);
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
          <>
            <SlideGeneratorForm
              onGenerate={handleGenerateProposal}
              onGenerateFromUrl={handleGenerateFromUrl}
              isLoading={isLoading}
            />
            <button
              onClick={handleOpenLoadDialog}
              className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              Cargar Presentación o Historial
            </button>
          </>
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
            onThemeChange={setCurrentTheme}
            initialTheme={currentTheme}
            onGenerateImages={async (slidesToUpdate) => {
              setIsLoading(true);
              setLoadingMessage('Generando imágenes...');
              cancelRef.current = false;
              
              const slidesWithImages: Slide[] = [];
              const imageSlidesCount = slidesToUpdate.filter(s => layoutSupportsImages(s.layout) && s.imagePrompt && !s.imageUrl).length;
              
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

                  if (layoutSupportsImages(slide.layout) && slide.imagePrompt && !slide.imageUrl) {
                    imagesGenerated++;
                    setLoadingMessage(`Generando imagen ${imagesGenerated} de ${imageSlidesCount}...`);
                    setProgress({ current: imagesGenerated, total: imageSlidesCount });
                    
                    try {
                      const detailedImagePrompt = buildImagePrompt(slide.imagePrompt, currentTheme);
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

        {/* Welcome Load Dialog */}
        {showWelcomeLoadDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-blue-400" />
                  Guardadas y Historial
                </h2>
                <button
                  onClick={() => setShowWelcomeLoadDialog(false)}
                  className="text-gray-400 hover:text-white p-1"
                  title="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-700 flex">
                <button
                  onClick={() => setLoadDialogTab('saved')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    loadDialogTab === 'saved'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Guardadas ({savedPresentations.length})
                </button>
                <button
                  onClick={() => setLoadDialogTab('history')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    loadDialogTab === 'history'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Historial ({historySnapshots.length})
                </button>
              </div>

              <div className="p-6">
                {loadDialogTab === 'saved' ? (
                  savedPresentations.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No hay presentaciones guardadas</p>
                  ) : (
                    <div className="space-y-3">
                      {savedPresentations.map((pres) => (
                        <div
                          key={pres.id}
                          className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <h3 className="text-white font-semibold">{pres.name}</h3>
                            <p className="text-gray-400 text-sm">
                              {pres.slides.length} slides • {new Date(pres.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleLoadPresentation(pres)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                          >
                            <FolderOpen className="w-4 h-4" />
                            Cargar
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  historySnapshots.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No hay historial guardado</p>
                  ) : (
                    <div className="space-y-3">
                      {historySnapshots.map((snapshot) => (
                        <div
                          key={snapshot.id}
                          className="bg-gray-700 rounded-lg p-4 flex justify-between items-center hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm">
                              {new Date(snapshot.timestamp).toLocaleString()}
                            </h3>
                            <p className="text-gray-400 text-xs mt-1">
                              {snapshot.slides.length} slides • {snapshot.preview || 'Sin preview'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleLoadHistorySnapshot(snapshot)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                          >
                            <FolderOpen className="w-4 h-4" />
                            Cargar
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppProvider>
  );
};

export default App;
