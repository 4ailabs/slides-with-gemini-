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
import { loadHistory, HistorySnapshot, clearHistory, getHistorySize } from '../services/historyService';
import { improveTextWithAI } from '../services/geminiService';
import { renderSlideForCapture } from '../utils/slideRenderer';
import { APP_CONFIG } from '../constants/config';
import { DragEndEvent } from '@dnd-kit/core';
import { defaultFontSettings } from '../constants/themes';
import { processSequentially } from '../utils/parallelProcessing';
import { RefreshCw, HelpCircle, Sparkles, Save, FolderOpen, Trash2, X } from 'lucide-react';
import IconPicker from './IconPicker';
import { ContentPoint } from '../types';

interface SlideViewerProps {
  slides: SlideType[];
  onReset: () => void;
  onSlidesUpdate?: (slides: SlideType[]) => void;
  onGenerateImages?: (slides: SlideType[]) => Promise<void>;
}


const SlideViewer: React.FC<SlideViewerProps> = ({ slides: initialSlides, onReset, onSlidesUpdate, onGenerateImages }) => {
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
  const [historySnapshots, setHistorySnapshots] = useState<HistorySnapshot[]>([]);
  const [loadDialogTab, setLoadDialogTab] = useState<'saved' | 'history'>('saved');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const currentSlideRef = useRef<HTMLDivElement>(null);


  // Sincronizar slides cuando cambian las initialSlides
  useEffect(() => {
    const slidesStr = JSON.stringify(initialSlides);
    const contextStr = JSON.stringify(appContext.slides);
    
    if (initialSlides.length > 0 && slidesStr !== contextStr) {
      appContext.setSlides(initialSlides);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlides.length, initialSlides]);

  useEffect(() => {
    if (onSlidesUpdate && slides.length > 0) {
      onSlidesUpdate(slides);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  useEffect(() => {
    if (showLoadDialog) {
      try {
        setSavedPresentations(loadAllPresentations());
        setHistorySnapshots(loadHistory().sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error loading presentations:', error);
        setDownloadMessage('Error al cargar presentaciones guardadas');
        setTimeout(() => setDownloadMessage(''), 3000);
      }
    }
  }, [showLoadDialog]);

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  // Asegurar que currentSlide esté dentro de los límites válidos
  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) {
      setCurrentSlide(Math.max(0, slides.length - 1));
    }
  }, [slides.length, currentSlide]);

  // Guardar referencia a la última longitud de slides para detectar cuando se agrega una nueva
  const prevSlidesLengthRef = useRef(slides.length);
  useEffect(() => {
    // Si se agregó una nueva slide (la longitud aumentó), navegar a la última
    if (slides.length > prevSlidesLengthRef.current) {
      setCurrentSlide(slides.length - 1);
    }
    prevSlidesLengthRef.current = slides.length;
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
    if (slides[currentSlide]) {
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], title: newTitle });
    }
  }, [currentSlide, slides, appContext]);

  const normalizeContent = useCallback((content: string[] | ContentPoint[]): ContentPoint[] => {
    return content.map(point => {
      if (typeof point === 'string') {
        return { text: point };
      }
      return point;
    });
  }, []);

  const handleContentChange = useCallback((index: number, newContent: string) => {
    if (slides[currentSlide]) {
      const content = slides[currentSlide].content || [];
      const normalizedContent = normalizeContent(content);
      const updatedContent = [...normalizedContent];
      updatedContent[index] = { ...updatedContent[index], text: newContent };
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
    }
  }, [currentSlide, slides, appContext, normalizeContent]);

  const handleIconChange = useCallback((index: number, iconName: string | undefined) => {
    if (iconName === '') {
      setIconPickerIndex(index);
      setShowIconPicker(true);
      return;
    }
    if (slides[currentSlide]) {
      const content = slides[currentSlide].content || [];
      const normalizedContent = normalizeContent(content);
      const updatedContent = [...normalizedContent];
      updatedContent[index] = { ...updatedContent[index], icon: iconName };
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
      setShowIconPicker(false);
      setIconPickerIndex(null);
    }
  }, [currentSlide, slides, appContext, normalizeContent]);

  const handleIconSelect = useCallback((iconName: string) => {
    if (iconPickerIndex !== null && slides[currentSlide]) {
      const content = slides[currentSlide].content || [];
      const normalizedContent = normalizeContent(content);
      const updatedContent = [...normalizedContent];
      updatedContent[iconPickerIndex] = { ...updatedContent[iconPickerIndex], icon: iconName };
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
    }
    setShowIconPicker(false);
    setIconPickerIndex(null);
  }, [iconPickerIndex, currentSlide, slides, appContext, normalizeContent]);

  const handleAddContent = useCallback(() => {
    if (slides[currentSlide]) {
      const content = slides[currentSlide].content || [];
      const normalizedContent = normalizeContent(content);
      appContext.updateSlide(currentSlide, { 
        ...slides[currentSlide], 
        content: [...normalizedContent, { text: '' }] 
      });
    }
  }, [currentSlide, slides, appContext, normalizeContent]);

  const handleRemoveContent = useCallback((index: number) => {
    if (slides[currentSlide]) {
      const content = slides[currentSlide].content || [];
      const normalizedContent = normalizeContent(content);
      const updatedContent = normalizedContent.filter((_, i) => i !== index);
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
    }
  }, [currentSlide, slides, appContext, normalizeContent]);

  const handleMoveContentUp = useCallback((index: number) => {
    if (slides[currentSlide] && index > 0) {
      const content = slides[currentSlide].content || [];
      const normalizedContent = normalizeContent(content);
      const updatedContent = [...normalizedContent];
      [updatedContent[index - 1], updatedContent[index]] = [updatedContent[index], updatedContent[index - 1]];
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
    }
  }, [currentSlide, slides, appContext, normalizeContent]);

  const handleMoveContentDown = useCallback((index: number) => {
    if (slides[currentSlide]) {
      const content = slides[currentSlide].content || [];
      const normalizedContent = normalizeContent(content);
      if (index < normalizedContent.length - 1) {
        const updatedContent = [...normalizedContent];
        [updatedContent[index], updatedContent[index + 1]] = [updatedContent[index + 1], updatedContent[index]];
        appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
      }
    }
  }, [currentSlide, slides, appContext, normalizeContent]);

  const handleImproveTitle = useCallback(async (originalTitle: string) => {
    try {
      const improved = await improveTextWithAI(originalTitle);
      if (slides[currentSlide]) {
        appContext.updateSlide(currentSlide, { ...slides[currentSlide], title: improved });
      }
      setDownloadMessage('Título mejorado con IA');
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      console.error('Error improving title:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setDownloadMessage(`Error: ${message}`);
      setTimeout(() => setDownloadMessage(''), 3000);
    }
  }, [currentSlide, slides, appContext]);

  const handleImproveContent = useCallback(async (index: number, originalContent: string) => {
    try {
      const improved = await improveTextWithAI(originalContent);
      if (slides[currentSlide]) {
        const content = slides[currentSlide].content || [];
        const normalizedContent = normalizeContent(content);
        const updatedContent = [...normalizedContent];
        updatedContent[index] = { ...updatedContent[index], text: improved };
        appContext.updateSlide(currentSlide, { ...slides[currentSlide], content: updatedContent });
      }
      setDownloadMessage('Contenido mejorado con IA');
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      console.error('Error improving content:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setDownloadMessage(`Error: ${message}`);
      setTimeout(() => setDownloadMessage(''), 3000);
    }
  }, [currentSlide, slides, appContext, normalizeContent]);

  const handleLayoutChange = useCallback((layout: SlideLayout) => {
    if (slides[currentSlide]) {
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], layout });
      setShowEditPanel(false);
    }
  }, [currentSlide, slides, appContext]);

  const handleImageChange = useCallback((imageUrl: string) => {
    if (slides[currentSlide]) {
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], imageUrl });
    }
  }, [currentSlide, slides, appContext]);

  const handleRegenerateImage = useCallback(async () => {
    if (!slides[currentSlide] || !slides[currentSlide].imagePrompt || !onGenerateImages) {
      return;
    }

    setIsRegeneratingImage(true);
    try {
      // Generar solo la imagen de esta slide
      await onGenerateImages([slides[currentSlide]]);
    } catch (error) {
      console.error('Error regenerating image:', error);
      setDownloadMessage('Error al regenerar la imagen');
      setTimeout(() => setDownloadMessage(''), 3000);
    } finally {
      setIsRegeneratingImage(false);
    }
  }, [currentSlide, slides, onGenerateImages]);

  const handleRemoveImage = useCallback(() => {
    if (slides[currentSlide]) {
      appContext.updateSlide(currentSlide, { ...slides[currentSlide], imageUrl: undefined });
    }
  }, [currentSlide, slides, appContext]);

  const handleAddSlide = useCallback(() => {
    const newSlide: SlideType = {
      title: 'Nueva Slide',
      content: [{ text: 'Nuevo punto' }],
      layout: 'text-image',
    };
    appContext.addSlide(newSlide);
    // Navegar a la nueva slide después de que se actualice el estado
    // Usamos un useEffect para manejar esto mejor
  }, [appContext]);

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

      // Procesar slides de forma secuencial para evitar conflictos de DOM
      const slideCanvases = await processSequentially<SlideType, HTMLCanvasElement>(
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

          const canvas = await htmlToCanvas(slideDiv);

          // Limpiar el React root después de capturar
          const root = (slideDiv as any).__slideRoot;
          if (root && typeof root.unmount === 'function') {
            root.unmount();
          }

          // Limpiar el contenedor para el siguiente slide
          container!.innerHTML = '';

          return canvas;
        },
        {
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
        if (!canvas) {
          console.warn(`Canvas ${i} is undefined, skipping`);
          continue;
        }
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

      // Procesar slides de forma secuencial para evitar conflictos de DOM
      const slideCanvases = await processSequentially<SlideType, HTMLCanvasElement>(
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

          const canvas = await htmlToCanvas(slideDiv);

          // Limpiar el React root después de capturar
          const root = (slideDiv as any).__slideRoot;
          if (root && typeof root.unmount === 'function') {
            root.unmount();
          }

          // Limpiar el contenedor para el siguiente slide
          container!.innerHTML = '';

          return canvas;
        },
        {
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

  const handleLoadHistorySnapshot = (snapshot: HistorySnapshot) => {
    try {
      if (!snapshot || !snapshot.slides || snapshot.slides.length === 0) {
        throw new Error('El snapshot está vacío o es inválido');
      }
      
      appContext.setSlides(snapshot.slides);
      setCurrentSlide(0);
      setShowLoadDialog(false);
      const timeStr = new Date(snapshot.timestamp).toLocaleTimeString();
      setDownloadMessage(`Snapshot de ${timeStr} cargado!`);
      setTimeout(() => setDownloadMessage(''), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setDownloadMessage(`Error al cargar snapshot: ${message}`);
      setTimeout(() => setDownloadMessage(''), 4000);
    }
  };

  const handleClearHistory = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
      clearHistory();
      setHistorySnapshots([]);
      setDownloadMessage('Historial limpiado');
      setTimeout(() => setDownloadMessage(''), 2000);
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
        {slides.length > 0 && slides[currentSlide] ? (
          <div className="w-full mb-4" ref={currentSlideRef}>
            <Slide
              slide={slides[currentSlide]}
              theme={currentTheme}
              fontSettings={fontSettings}
              isEditable={isEditMode}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
              onIconChange={handleIconChange}
              onAddContent={handleAddContent}
              onRemoveContent={handleRemoveContent}
              onMoveContentUp={handleMoveContentUp}
              onMoveContentDown={handleMoveContentDown}
              onImproveTitle={handleImproveTitle}
              onImproveContent={handleImproveContent}
            />
          </div>
        ) : (
          <div className="w-full mb-4 text-center text-gray-400">
            No hay slides disponibles
          </div>
        )}

        {downloadMessage && (
          <div className={`w-full mb-4 px-4 py-2 rounded-lg text-center ${
            downloadMessage.includes('Error') 
              ? 'bg-red-900 text-red-200' 
              : 'bg-green-900 text-green-200'
          }`}>
            {downloadMessage}
          </div>
        )}

        {/* Banner para generar imágenes si hay slides sin imágenes */}
        {onGenerateImages && slides.some(s => s.layout === 'text-image' && s.imagePrompt && !s.imageUrl) && (
          <div className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Slides sin imágenes generadas</h3>
              <p className="text-gray-300 text-sm">
                Tienes {slides.filter(s => s.layout === 'text-image' && s.imagePrompt && !s.imageUrl).length} slide(s) que pueden tener imágenes generadas
              </p>
            </div>
            <button
              onClick={async () => {
                if (onGenerateImages) {
                  await onGenerateImages(slides);
                  // Actualizar el contexto con las slides actualizadas
                  if (initialSlides.length > 0) {
                    // Esperar a que App.tsx actualice el estado
                    setTimeout(() => {
                      // El useEffect se encargará de sincronizar cuando initialSlides cambie
                    }, 500);
                  }
                }
              }}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generar Imágenes
            </button>
          </div>
        )}

        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            disabled={isDownloading}
          >
            <RefreshCw className="w-4 h-4" />
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
              onAddSlide={handleAddSlide}
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
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
              title="Ver atajos de teclado (?)"
            >
              <HelpCircle className="w-4 h-4" />
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

      {showEditPanel && slides.length > 0 && slides[currentSlide] && (
        <EditPanel
          currentLayout={slides[currentSlide]?.layout || 'text-image'}
          currentTheme={currentTheme}
          fontSettings={fontSettings}
          currentImageUrl={slides[currentSlide]?.imageUrl}
          onLayoutChange={handleLayoutChange}
          onThemeChange={setCurrentTheme}
          onFontSettingsChange={setFontSettings}
          onImageChange={handleImageChange}
          onRegenerateImage={slides[currentSlide]?.imagePrompt ? handleRegenerateImage : undefined}
          onRemoveImage={handleRemoveImage}
          isRegeneratingImage={isRegeneratingImage}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Save className="w-6 h-6 text-teal-400" />
                Guardar Presentación
              </h2>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setPresentationName('');
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleSavePresentation}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
      )}

      {showIconPicker && (
        <IconPicker
          onSelect={handleIconSelect}
          onClose={() => {
            setShowIconPicker(false);
            setIconPickerIndex(null);
          }}
          currentTheme={currentTheme}
        />
      )}

      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-blue-400" />
                Guardadas y Historial
              </h2>
              <button
                onClick={() => setShowLoadDialog(false)}
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadPresentation(pres)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                          >
                            <FolderOpen className="w-4 h-4" />
                            Cargar
                          </button>
                          <button
                            onClick={() => handleDeletePresentation(pres.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <>
                  {historySnapshots.length === 0 ? (
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
                  )}
                  {historySnapshots.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <button
                        onClick={handleClearHistory}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Limpiar Todo el Historial
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Espacio usado: {(getHistorySize() / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideViewer;
