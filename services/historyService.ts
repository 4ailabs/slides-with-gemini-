import { Slide } from '../types';

const HISTORY_KEY = 'slides_history';
const MAX_HISTORY_ITEMS = 50; // Máximo de items en historial

export interface HistorySnapshot {
  id: string;
  slides: Slide[];
  timestamp: number;
  preview?: string; // Preview text para UI
}

/**
 * Servicio para guardar y cargar historial de ediciones en localStorage
 */

/**
 * Guarda un snapshot del historial
 */
export function saveHistorySnapshot(slides: Slide[]): void {
  try {
    const history = loadHistory();
    
    // Crear nuevo snapshot
    const snapshot: HistorySnapshot = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      slides: JSON.parse(JSON.stringify(slides)),
      timestamp: Date.now(),
      preview: generatePreview(slides),
    };
    
    // Limitar tamaño del historial
    history.push(snapshot);
    if (history.length > MAX_HISTORY_ITEMS) {
      history.shift(); // Eliminar el más antiguo
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history snapshot:', error);
    // No lanzar error, solo loguear para no interrumpir el flujo
  }
}

/**
 * Carga todo el historial
 */
export function loadHistory(): HistorySnapshot[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid history data format, resetting');
      localStorage.removeItem(HISTORY_KEY);
      return [];
    }
    
    return parsed as HistorySnapshot[];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

/**
 * Elimina un snapshot específico del historial
 */
export function deleteHistorySnapshot(id: string): boolean {
  try {
    const history = loadHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting history snapshot:', error);
    return false;
  }
}

/**
 * Limpia todo el historial
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Obtiene el tamaño aproximado del historial en bytes
 */
export function getHistorySize(): number {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? new Blob([data]).size : 0;
  } catch {
    return 0;
  }
}

/**
 * Genera un preview text para el snapshot
 */
function generatePreview(slides: Slide[]): string {
  if (!slides || slides.length === 0) return 'Sin slides';
  
  const titles = slides.map(s => s.title).filter(Boolean);
  if (titles.length === 0) return `${slides.length} slides`;
  
  const preview = titles.slice(0, 3).join(', ');
  return titles.length > 3 ? `${preview}...` : preview;
}

