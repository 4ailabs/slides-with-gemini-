import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '../context/AppContext';
import { Slide } from '../types';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  const testSlide: Slide = {
    title: 'Test Slide',
    content: ['Point 1', 'Point 2'],
    layout: 'text-only',
  };

  const testSlide2: Slide = {
    title: 'Test Slide 2',
    content: ['Point 3'],
    layout: 'text-image',
  };

  beforeEach(() => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    act(() => {
      result.current.setSlides([]);
    });
  });

  it('should initialize with empty slides', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    expect(result.current.slides).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should set slides', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.setSlides([testSlide]);
    });
    
    expect(result.current.slides).toHaveLength(1);
    expect(result.current.slides[0].title).toBe('Test Slide');
  });

  it('should add a slide', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.addSlide(testSlide);
    });
    
    expect(result.current.slides).toHaveLength(1);
  });

  it('should update a slide', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.setSlides([testSlide]);
      result.current.updateSlide(0, { ...testSlide, title: 'Updated Title' });
    });
    
    expect(result.current.slides[0].title).toBe('Updated Title');
  });

  it('should remove a slide', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.setSlides([testSlide, testSlide2]);
      result.current.removeSlide(0);
    });
    
    expect(result.current.slides).toHaveLength(1);
    expect(result.current.slides[0].title).toBe('Test Slide 2');
  });

  it('should duplicate a slide', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.setSlides([testSlide]);
      result.current.duplicateSlide(0);
    });
    
    expect(result.current.slides).toHaveLength(2);
    expect(result.current.slides[0].title).toBe('Test Slide');
    expect(result.current.slides[1].title).toBe('Test Slide (copia)');
  });

  it('should reorder slides', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.setSlides([testSlide, testSlide2]);
      result.current.reorderSlides(0, 1);
    });
    
    expect(result.current.slides[0].title).toBe('Test Slide 2');
    expect(result.current.slides[1].title).toBe('Test Slide');
  });

  it('should support undo/redo', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.setSlides([testSlide]);
    });
    
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    
    act(() => {
      result.current.updateSlide(0, { ...testSlide, title: 'Updated' });
    });
    
    expect(result.current.slides[0].title).toBe('Updated');
    expect(result.current.canUndo).toBe(true);
    
    act(() => {
      result.current.undo();
    });
    
    expect(result.current.slides[0].title).toBe('Test Slide');
    expect(result.current.canRedo).toBe(true);
    
    act(() => {
      result.current.redo();
    });
    
    expect(result.current.slides[0].title).toBe('Updated');
  });

  it('should not duplicate slide with invalid index', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.setSlides([testSlide]);
      result.current.duplicateSlide(-1);
    });
    
    expect(result.current.slides).toHaveLength(1);
    
    act(() => {
      result.current.duplicateSlide(10);
    });
    
    expect(result.current.slides).toHaveLength(1);
  });
});

