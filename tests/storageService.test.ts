import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  savePresentation, 
  loadAllPresentations, 
  loadPresentation,
  deletePresentation,
  updatePresentation,
  clearAllPresentations,
} from '../services/storageService';
import { Slide } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storageService', () => {
  beforeEach(() => {
    clearAllPresentations();
  });

  const validSlide: Slide = {
    title: 'Test Slide',
    content: ['Point 1', 'Point 2'],
    layout: 'text-only',
  };

  describe('savePresentation', () => {
    it('should save a valid presentation', () => {
      const id = savePresentation('Test Presentation', [validSlide]);
      
      expect(id).toBeTruthy();
      expect(id).toContain('pres_');
      
      const saved = loadAllPresentations();
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Test Presentation');
      expect(saved[0].slides).toHaveLength(1);
    });

    it('should throw error for empty name', () => {
      expect(() => {
        savePresentation('', [validSlide]);
      }).toThrow('El nombre de la presentación es requerido');
    });

    it('should throw error for empty slides array', () => {
      expect(() => {
        savePresentation('Test', []);
      }).toThrow('La presentación debe tener al menos una slide');
    });

    it('should trim presentation name', () => {
      const id = savePresentation('  Test Presentation  ', [validSlide]);
      const saved = loadAllPresentations();
      expect(saved[0].name).toBe('Test Presentation');
    });
  });

  describe('loadPresentation', () => {
    it('should load a saved presentation by id', () => {
      const id = savePresentation('Test Presentation', [validSlide]);
      const loaded = loadPresentation(id);
      
      expect(loaded).toBeTruthy();
      expect(loaded?.name).toBe('Test Presentation');
      expect(loaded?.slides).toHaveLength(1);
    });

    it('should return null for non-existent id', () => {
      const loaded = loadPresentation('non-existent-id');
      expect(loaded).toBeNull();
    });
  });

  describe('loadAllPresentations', () => {
    it('should return empty array when no presentations saved', () => {
      const presentations = loadAllPresentations();
      expect(presentations).toEqual([]);
    });

    it('should load all saved presentations', () => {
      savePresentation('Presentation 1', [validSlide]);
      savePresentation('Presentation 2', [validSlide]);
      
      const presentations = loadAllPresentations();
      expect(presentations).toHaveLength(2);
    });
  });

  describe('updatePresentation', () => {
    it('should update an existing presentation', () => {
      const id = savePresentation('Original Name', [validSlide]);
      const updated = updatePresentation(id, 'Updated Name', [validSlide, validSlide]);
      
      expect(updated).toBe(true);
      
      const loaded = loadPresentation(id);
      expect(loaded?.name).toBe('Updated Name');
      expect(loaded?.slides).toHaveLength(2);
    });

    it('should return false for non-existent id', () => {
      const updated = updatePresentation('non-existent-id', 'New Name', [validSlide]);
      expect(updated).toBe(false);
    });

    it('should throw error for empty name', () => {
      const id = savePresentation('Test', [validSlide]);
      expect(() => {
        updatePresentation(id, '', [validSlide]);
      }).toThrow('El nombre de la presentación es requerido');
    });
  });

  describe('deletePresentation', () => {
    it('should delete an existing presentation', () => {
      const id = savePresentation('Test Presentation', [validSlide]);
      const deleted = deletePresentation(id);
      
      expect(deleted).toBe(true);
      expect(loadAllPresentations()).toHaveLength(0);
    });

    it('should return false for non-existent id', () => {
      const deleted = deletePresentation('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('clearAllPresentations', () => {
    it('should clear all presentations', () => {
      savePresentation('Presentation 1', [validSlide]);
      savePresentation('Presentation 2', [validSlide]);
      
      clearAllPresentations();
      
      expect(loadAllPresentations()).toHaveLength(0);
    });
  });
});

