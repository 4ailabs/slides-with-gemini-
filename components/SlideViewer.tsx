import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import { Slide as SlideType, SlideLayout, ThemeName, FontSettings } from '../types';
import Slide from './Slide';
import EditPanel from './EditPanel';
import PresentationMode from './PresentationMode';
import ExportMenu from './ExportMenu';
import KeyboardShortcuts from './KeyboardShortcuts';
import SlideActions from './SlideActions';
import SlideNavigation from './SlideNavigation';
import SlideList from './SlideList';
import { useAppContext } from '../context/AppContext';
import { downloadSlidesAsPDF, downloadSlidesAsImages, downloadCurrentSlideAsImage, exportToPowerPoint, htmlToCanvas } from '../services/downloadService';
import { savePresentation, loadAllPresentations, SavedPresentation, deletePresentation } from '../services/storageService';
import { renderSlideForCapture } from '../utils/slideRenderer';
import { APP_CONFIG } from '../constants/config';
import { DragEndEvent } from '@dnd-kit/core';
import { defaultFontSettings } from '../constants/themes';
import { processWithConcurrencyLimit } from '../utils/parallelProcessing';

interface SlideViewerProps {
  slides: SlideType[];
  onReset: () => void;
  onSlidesUpdate?: (slides: SlideType[]) => void;
}


const SlideViewer: React.FC<SlideViewerProps> = ({ slides: initialSlides, onReset, onSlidesUpdate }) => {
  const appContext = useAppContext();
  const slides = appContext.slides.length > 0 ? appContext.slides : initialSlides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showSlideList, setShowSlideList] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('purple-pink');
  const [fontSettings, setFontSettings] = useState<FontSettings>(defaultFontSettings);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [presentationName, setPresentationName] = useState('');
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const currentSlideRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (initialSlides.length > 0 && initialSlides !== slides) {
      appContext.setSlides(initialSlides);
    }
  }, [initialSlides, appContext]);

  useEffect(() => {
    if (onSlidesUpdate) {
      onSlidesUpdate(slides);
    }
  }, [slides, onSlidesUpdate]);

  useEffect(() => {
    if (showLoadDialog) {
      try {
        setSavedPresentations(loadAllPresentations());
      } catch (error) {
        console.error('Error loading presentations:', error);
        setDownloadMessage('Error al cargar presentaciones guardadas');
        setTimeout(() => setDownloadMessage(''), 3000);
      }
    }
  }, [showLoadDialog]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isEditMode && !isPresentationMode) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Atajos globales
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          if (appContext.canUndo) {
            appContext.undo();
          }
          return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          if (appContext.canRedo) {
            appContext.redo();
          }
          return;
        }
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          setIsEditMode(!isEditMode);
          return;
        }
        if (e.key === '?') {
          e.preventDefault();
          setShowShortcuts(true);
          return;
        }

        // Navegación de slides
        if (e.key === 'ArrowRight') {
          nextSlide();
        } else if (e.key === 'ArrowLeft') {
          prevSlide();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [nextSlide, prevSlide, isEditMode, isPresentationMode, appContext]);

  const handleTitleChange = useCallback((newTitle: string) => {
    appContext.updateSlide(currentSlide, { ...slides[currentSlide], title: newTitle });
  }, [currentSlide, slides, appContext]);

  const handleContentChange = useCallback((index: number, newContent: string) => {
    const updatedContent = [...slides[currentSlide].content];
    updatedContent[index] = newContent;
    appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
  }, [currentSlide, slides, appContext]);

  const handleAddContent = useCallback(() => {
    const updatedContent = [...slides[currentSlide].content, 'Nuevo punto'];
    appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
  }, [currentSlide, slides, appContext]);

  const handleRemoveContent = useCallback((index: number) => {
    const updatedContent = slides[currentSlide].content.filter((_, i) => i !== index);
    appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
  }, [currentSlide, slides, appContext]);

  const handleLayoutChange = useCallback((layout: SlideLayout) => {
    appContext.updateSlide(currentSlide, { ...slides[currentSlide], layout });
    setShowEditPanel(false);
  }, [currentSlide, slides, appContext]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace('slide-', ''));
      const newIndex = parseInt(over.id.toString().replace('slide-', ''));
      appContext.reorderSlides(oldIndex, newIndex);
      if (currentSlide === oldIndex) {
        setCurrentSlide(newIndex);
      } else if (currentSlide === newIndex) {
        setCurrentSlide(oldIndex);
      } else if (currentSlide > oldIndex && currentSlide < newIndex) {
        setCurrentSlide(currentSlide - 1);
      } else if (currentSlide < oldIndex && currentSlide > newIndex) {
        setCurrentSlide(currentSlide + 1);
      }
    }
  }, [currentSlide, appContext]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setDownloadMessage(APP_CONFIG.MESSAGES.GENERATING_PDF);

    let container: HTMLElement | null = null;

    try {
      container = document.createElement('div');
      const width = currentSlideRef.current?.offsetWidth || APP_CONFIG.SLIDE_WIDTH;
      const height = currentSlideRef.current?.offsetHeight || APP_CONFIG.SLIDE_HEIGHT;

      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      // Procesar slides en paralelo (3 a la vez para no sobrecargar)
      const slideCanvases = await processWithConcurrencyLimit<SlideType, HTMLCanvasElement>(
        slides,
        async (slide: SlideType, index: number) => {
          setDownloadMessage(`${APP_CONFIG.MESSAGES.GENERATING_PDF} (${index + 1}/${slides.length})`);

          const slideDiv = await renderSlideForCapture(
            slide,
            currentTheme,
            fontSettings,
            container!,
            width,
            height
          );

          return await htmlToCanvas(slideDiv);
        },
        {
          concurrency: 3,
          onProgress: (completed: number, total: number) => {
            setDownloadMessage(`${APP_CONFIG.MESSAGES.GENERATING_PDF} (${completed}/${total})`);
          }
        }
      );

      // Convertir canvases a imágenes y agregar al PDF
      const { jsPDF } = await import('jspdf');
      const pdfDoc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [APP_CONFIG.PDF_WIDTH, APP_CONFIG.PDF_HEIGHT],
      });

      for (let i = 0; i < slideCanvases.length; i++) {
        if (i > 0) {
          pdfDoc.addPage();
        }
        const canvas = slideCanvases[i];
        const imgData = canvas.toDataURL('image/png');
        pdfDoc.addImage(imgData, 'PNG', 0, 0, APP_CONFIG.PDF_WIDTH, APP_CONFIG.PDF_HEIGHT);
      }

      pdfDoc.save(APP_CONFIG.DEFAULT_PDF_NAME);
      setDownloadMessage(APP_CONFIG.MESSAGES.SUCCESS_PDF);
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error downloading PDF:', error);
      setDownloadMessage(`${APP_CONFIG.MESSAGES.ERROR_PDF} ${message}`);
      setTimeout(() => setDownloadMessage(''), 4000);
    } finally {
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }
      setIsDownloading(false);
    }
  };

  const handleDownloadAllImages = async () => {
    setIsDownloading(true);
    setDownloadMessage(APP_CONFIG.MESSAGES.GENERATING_IMAGES);
    
    let container: HTMLElement | null = null;
    
    try {
      container = document.createElement('div');
      const width = currentSlideRef.current?.offsetWidth || APP_CONFIG.SLIDE_WIDTH;
      const height = currentSlideRef.current?.offsetHeight || APP_CONFIG.SLIDE_HEIGHT;
      
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      for (let i = 0; i < slides.length; i++) {
        setDownloadMessage(`${APP_CONFIG.MESSAGES.GENERATING_IMAGES} ${i + 1}/${slides.length}...`);
        
        const slideDiv = await renderSlideForCapture(
          slides[i],
          currentTheme,
          fontSettings,
          container,
          width,
          height
        );
        
        // Capturar y descargar inmediatamente
        const canvas = await htmlToCanvas(slideDiv);
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to convert canvas to blob'));
          }, 'image/png');
        });
        
        const safeTitle = slides[i].title.substring(0, 20).replace(/[^a-z0-9]/gi, '-');
        const filename = `${APP_CONFIG.DEFAULT_IMAGE_PREFIX}-${i + 1}-${safeTitle}.png`;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Delay entre descargas
        await new Promise(resolve => setTimeout(resolve, APP_CONFIG.DOWNLOAD_DELAY));
      }
      
      setDownloadMessage(APP_CONFIG.MESSAGES.SUCCESS_IMAGES);
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error downloading images:', error);
      setDownloadMessage(`${APP_CONFIG.MESSAGES.ERROR_IMAGES} ${message}`);
      setTimeout(() => setDownloadMessage(''), 4000);
    } finally {
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }
      setIsDownloading(false);
    }
  };

  const handleDownloadCurrentSlide = async () => {
    if (!currentSlideRef.current) {
      setDownloadMessage('No hay slide para descargar');
      setTimeout(() => setDownloadMessage(''), 2000);
      return;
    }
    
    setIsDownloading(true);
    setDownloadMessage(APP_CONFIG.MESSAGES.GENERATING_IMAGE);
    
    try {
      await downloadCurrentSlideAsImage(currentSlideRef.current, slides[currentSlide], currentSlide);
      setDownloadMessage(APP_CONFIG.MESSAGES.SUCCESS_IMAGE);
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error downloading current slide:', error);
      setDownloadMessage(`${APP_CONFIG.MESSAGES.ERROR_IMAGE} ${message}`);
      setTimeout(() => setDownloadMessage(''), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportPowerPoint = async () => {
    setIsDownloading(true);
    setDownloadMessage(APP_CONFIG.MESSAGES.GENERATING_PPTX);

    let container: HTMLElement | null = null;

    try {
      container = document.createElement('div');
      const width = currentSlideRef.current?.offsetWidth || APP_CONFIG.SLIDE_WIDTH;
      const height = currentSlideRef.current?.offsetHeight || APP_CONFIG.SLIDE_HEIGHT;

      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      // Procesar slides en paralelo
      const slideCanvases = await processWithConcurrencyLimit<SlideType, HTMLCanvasElement>(
        slides,
        async (slide: SlideType, index: number) => {
          setDownloadMessage(`${APP_CONFIG.MESSAGES.GENERATING_PPTX} (${index + 1}/${slides.length})`);

          const slideDiv = await renderSlideForCapture(
            slide,
            currentTheme,
            fontSettings,
            container!,
            width,
            height
          );

          return await htmlToCanvas(slideDiv);
        },
        {
          concurrency: 3,
          onProgress: (completed: number, total: number) => {
            setDownloadMessage(`${APP_CONFIG.MESSAGES.GENERATING_PPTX} (${completed}/${total})`);
          }
        }
      );

      await exportToPowerPoint(slides, slideCanvases);
      setDownloadMessage(APP_CONFIG.MESSAGES.SUCCESS_PPTX);
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error exporting PowerPoint:', error);
      setDownloadMessage(`${APP_CONFIG.MESSAGES.ERROR_PPTX} ${message}`);
      setTimeout(() => setDownloadMessage(''), 4000);
    } finally {
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }
      setIsDownloading(false);
    }
  };

  const handleSavePresentation = () => {
    if (!presentationName.trim()) {
      setDownloadMessage('Por favor ingresa un nombre para la presentación');
      setTimeout(() => setDownloadMessage(''), 3000);
      return;
    }
    
    try {
      savePresentation(presentationName.trim(), slides);
      setShowSaveDialog(false);
      setPresentationName('');
      setDownloadMessage(APP_CONFIG.MESSAGES.SUCCESS_SAVED);
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setDownloadMessage(`Error: ${message}`);
      setTimeout(() => setDownloadMessage(''), 4000);
    }
  };

  const handleLoadPresentation = (presentation: SavedPresentation) => {
    try {
      if (!presentation || !presentation.slides || presentation.slides.length === 0) {
        throw new Error('La presentación está vacía o es inválida');
      }
      
      appContext.setSlides(presentation.slides);
      setCurrentSlide(0);
      setShowLoadDialog(false);
      setDownloadMessage(`Presentación "${presentation.name}" cargada!`);
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setDownloadMessage(`Error al cargar: ${message}`);
      setTimeout(() => setDownloadMessage(''), 4000);
    }
  };

  const handleDeletePresentation = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta presentación?')) {
      deletePresentation(id);
      setSavedPresentations(loadAllPresentations());
    }
  };

  return (
    <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4">
      {isEditMode && showSlideList && (
        <SlideList
          slides={slides}
          currentSlide={currentSlide}
          onSlideClick={setCurrentSlide}
          onDragEnd={handleDragEnd}
          onDuplicate={(index) => {
            appContext.duplicateSlide(index);
            if (index <= currentSlide) {
              setCurrentSlide(currentSlide + 1);
            }
          }}
          onDelete={(index) => {
            if (confirm('¿Estás seguro de que quieres eliminar esta slide?')) {
              appContext.removeSlide(index);
              if (index < currentSlide) {
                setCurrentSlide(currentSlide - 1);
              } else if (index === currentSlide && currentSlide >= slides.length - 1) {
                setCurrentSlide(Math.max(0, currentSlide - 1));
              }
            }
          }}
        />
      )}

      {/* Área principal */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full mb-4" ref={currentSlideRef}>
          <Slide
            slide={slides[currentSlide]}
            theme={currentTheme}
            fontSettings={fontSettings}
            isEditable={isEditMode}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
            onAddContent={handleAddContent}
            onRemoveContent={handleRemoveContent}
          />
        </div>

        {downloadMessage && (
          <div className={`w-full mb-4 px-4 py-2 rounded-lg text-center ${
            downloadMessage.includes('Error') 
              ? 'bg-red-900 text-red-200' 
              : 'bg-green-900 text-green-200'
          }`}>
            {downloadMessage}
          </div>
        )}

        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            disabled={isDownloading}
          >
            Start Over
          </button>
          
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <SlideActions
              isEditMode={isEditMode}
              onToggleEdit={() => setIsEditMode(!isEditMode)}
              onShowSlideList={() => setShowSlideList(!showSlideList)}
              showSlideList={showSlideList}
              onShowEditPanel={() => setShowEditPanel(true)}
              canUndo={appContext.canUndo}
              canRedo={appContext.canRedo}
              onUndo={appContext.undo}
              onRedo={appContext.redo}
              onDuplicate={() => appContext.duplicateSlide(currentSlide)}
            />

            <ExportMenu
              onExportPDF={handleDownloadPDF}
              onExportPPTX={handleExportPowerPoint}
              onExportImages={handleDownloadAllImages}
              onExportCurrentSlide={handleDownloadCurrentSlide}
              onStartPresentation={() => setIsPresentationMode(true)}
              onSave={() => setShowSaveDialog(true)}
              onLoad={() => setShowLoadDialog(true)}
              isDownloading={isDownloading}
              disabled={isEditMode}
            />
            <button
              onClick={() => setShowShortcuts(true)}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-sm"
              title="Ver atajos de teclado (?)"
            >
              ?
            </button>
          </div>

          <SlideNavigation
            currentSlide={currentSlide}
            totalSlides={slides.length}
            onPrev={prevSlide}
            onNext={nextSlide}
            disabled={isDownloading || isEditMode}
          />
        </div>
      </div>

      {showEditPanel && (
        <EditPanel
          currentLayout={slides[currentSlide].layout}
          currentTheme={currentTheme}
          fontSettings={fontSettings}
          onLayoutChange={handleLayoutChange}
          onThemeChange={setCurrentTheme}
          onFontSettingsChange={setFontSettings}
          onClose={() => setShowEditPanel(false)}
        />
      )}

      {isPresentationMode && (
        <PresentationMode
          slides={slides}
          initialSlide={currentSlide}
          theme={currentTheme}
          fontSettings={fontSettings}
          onExit={() => setIsPresentationMode(false)}
        />
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Guardar Presentación</h2>
            <input
              type="text"
              value={presentationName}
              onChange={(e) => setPresentationName(e.target.value)}
              placeholder="Nombre de la presentación"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleSavePresentation()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setPresentationName('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePresentation}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
      )}

      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Presentaciones Guardadas</h2>
              <button
                onClick={() => setShowLoadDialog(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {savedPresentations.length === 0 ? (
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadPresentation(pres)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => handleDeletePresentation(pres.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideViewer;
