import { Slide } from '../types';
import { validateSlides } from '../constants/config';

const STORAGE_KEY = 'slides_presentations';
const MAX_PRESENTATIONS = 50; // Límite de presentaciones guardadas

export interface SavedPresentation {
  id: string;
  name: string;
  slides: Slide[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Guarda una presentación en localStorage
 * Valida los datos antes de guardar y gestiona el límite de presentaciones
 * @param name - Nombre de la presentación (debe ser único y no vacío)
 * @param slides - Array de slides a guardar (debe tener al menos una slide)
 * @returns ID único de la presentación guardada
 * @throws Error si el nombre está vacío, no hay slides, o hay un error de storage
 */
export function savePresentation(name: string, slides: Slide[]): string {
  if (!name || !name.trim()) {
    throw new Error('El nombre de la presentación es requerido');
  }
  
  if (!slides || slides.length === 0) {
    throw new Error('La presentación debe tener al menos una slide');
  }
  
  if (!validateSlides(slides)) {
    throw new Error('Las slides no tienen un formato válido');
  }
  
  const presentations = loadAllPresentations();
  
  // Limitar el número de presentaciones guardadas
  if (presentations.length >= MAX_PRESENTATIONS) {
    // Eliminar la más antigua
    presentations.sort((a, b) => a.createdAt - b.createdAt);
    presentations.shift();
  }
  
  const id = `pres_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  
  const presentation: SavedPresentation = {
    id,
    name: name.trim(),
    slides: JSON.parse(JSON.stringify(slides)), // Deep copy
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  presentations.push(presentation);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('No hay espacio suficiente para guardar la presentación. Por favor, elimina algunas presentaciones guardadas.');
    }
    throw error;
  }
  
  return id;
}

export function updatePresentation(id: string, name: string, slides: Slide[]): boolean {
  if (!name || !name.trim()) {
    throw new Error('El nombre de la presentación es requerido');
  }
  
  if (!slides || slides.length === 0) {
    throw new Error('La presentación debe tener al menos una slide');
  }
  
  if (!validateSlides(slides)) {
    throw new Error('Las slides no tienen un formato válido');
  }
  
  const presentations = loadAllPresentations();
  const index = presentations.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  presentations[index] = {
    ...presentations[index],
    name: name.trim(),
    slides: JSON.parse(JSON.stringify(slides)),
    updatedAt: Date.now(),
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('No hay espacio suficiente para actualizar la presentación.');
    }
    throw error;
  }
  
  return true;
}

export function deletePresentation(id: string): boolean {
  const presentations = loadAllPresentations();
  const filtered = presentations.filter(p => p.id !== id);
  
  if (filtered.length === presentations.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function loadPresentation(id: string): SavedPresentation | null {
  const presentations = loadAllPresentations();
  return presentations.find(p => p.id === id) || null;
}

export function loadAllPresentations(): SavedPresentation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid presentations data format, resetting storage');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    
    // Validar y filtrar presentaciones inválidas
    return parsed.filter((pres: unknown): pres is SavedPresentation => {
      if (!pres || typeof pres !== 'object') return false;
      const p = pres as Record<string, unknown>;
      
      return (
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        typeof p.createdAt === 'number' &&
        typeof p.updatedAt === 'number' &&
        validateSlides(p.slides)
      );
    });
  } catch (error) {
    console.error('Error loading presentations:', error);
    // Reset storage on critical error
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return [];
  }
}

export function clearAllPresentations(): void {
  localStorage.removeItem(STORAGE_KEY);
}

