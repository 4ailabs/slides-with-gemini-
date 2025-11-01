import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Slide } from '../types';
import { slideSchema } from '../schemas/slideSchema';
import { saveHistorySnapshot } from '../services/historyService';

/**
 * Contexto de aplicación que gestiona el estado global de las slides
 * Incluye funcionalidades de historial para undo/redo
 */
interface AppContextType {
  slides: Slide[];
  setSlides: (slides: Slide[]) => void;
  updateSlide: (index: number, slide: Slide) => void;
  addSlide: (slide: Slide) => void;
  removeSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialSlides?: Slide[];
}

const MAX_HISTORY = 20;

export const AppProvider: React.FC<AppProviderProps> = ({ children, initialSlides = [] }) => {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [history, setHistory] = useState<Slide[][]>([initialSlides]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveToHistory = useCallback((newSlides: Slide[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newSlides);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const updateSlide = useCallback((index: number, slide: Slide) => {
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[index] = slide;
      saveToHistory(newSlides);
      return newSlides;
    });
  }, [saveToHistory]);

  const addSlide = useCallback((slide: Slide) => {
    setSlides((prev) => {
      const newSlides = [...prev, slide];
      saveToHistory(newSlides);
      return newSlides;
    });
  }, [saveToHistory]);

  const removeSlide = useCallback((index: number) => {
    setSlides((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const newSlides = prev.filter((_, i) => i !== index);
      saveToHistory(newSlides);
      return newSlides;
    });
  }, [saveToHistory]);

  /**
   * Duplica una slide en la posición especificada
   * @param index - Índice de la slide a duplicar
   */
  const duplicateSlide = useCallback((index: number) => {
    setSlides((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const slideToDuplicate = prev[index];
      
      // Validar la slide antes de duplicar
      const validationResult = slideSchema.safeParse(slideToDuplicate);
      if (!validationResult.success) {
        console.error('Error validando slide antes de duplicar:', validationResult.error);
        return prev;
      }
      
      const newSlides = [...prev];
      const duplicatedSlide = {
        ...slideToDuplicate,
        title: `${slideToDuplicate.title} (copia)`,
      };
      newSlides.splice(index + 1, 0, duplicatedSlide);
      saveToHistory(newSlides);
      return newSlides;
    });
  }, [saveToHistory]);

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    setSlides((prev) => {
      const newSlides = [...prev];
      const [moved] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, moved);
      saveToHistory(newSlides);
      return newSlides;
    });
  }, [saveToHistory]);

  const setSlidesWithHistory = useCallback((newSlides: Slide[]) => {
    setSlides(newSlides);
    saveToHistory(newSlides);
  }, [saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSlides(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSlides(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Guardar snapshots en localStorage periódicamente
  useEffect(() => {
    if (slides.length > 0) {
      // Debounce para no guardar demasiado seguido
      const timeoutId = setTimeout(() => {
        saveHistorySnapshot(slides);
      }, 2000); // Guardar después de 2 segundos de inactividad
      
      return () => clearTimeout(timeoutId);
    }
  }, [slides]);

  return (
    <AppContext.Provider
      value={{
        slides,
        setSlides: setSlidesWithHistory,
        updateSlide,
        addSlide,
        removeSlide,
        duplicateSlide,
        reorderSlides,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        undo,
        redo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

