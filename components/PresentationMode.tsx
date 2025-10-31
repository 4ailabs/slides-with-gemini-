import React, { useState, useEffect, useCallback } from 'react';
import { Slide as SlideType } from '../types';
import Slide from './Slide';
import { ThemeName, FontSettings } from '../types';
import { defaultFontSettings } from '../constants/themes';

interface PresentationModeProps {
  slides: SlideType[];
  initialSlide: number;
  theme: ThemeName;
  fontSettings: FontSettings;
  onExit: () => void;
}

const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  initialSlide,
  theme,
  fontSettings,
  onExit,
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onExit]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Barra de controles superior */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg flex items-center gap-4 z-10">
        <button
          onClick={prevSlide}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          ← Anterior
        </button>
        <span className="text-white font-medium">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          onClick={nextSlide}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Siguiente →
        </button>
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors ml-4"
        >
          {isFullscreen ? '🗗 Salir' : '🗖 Pantalla Completa'}
        </button>
        <button
          onClick={onExit}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors ml-2"
        >
          ✕ Salir
        </button>
      </div>

      {/* Slide */}
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="w-full max-w-7xl h-full flex items-center justify-center">
          <Slide
            slide={slides[currentSlide]}
            theme={theme}
            fontSettings={fontSettings}
          />
        </div>
      </div>

      {/* Indicadores de navegación lateral */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-purple-500 scale-125'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Instrucciones en la parte inferior */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg text-white text-sm z-10">
        Usa las flechas o la barra espaciadora para navegar | Presiona ESC para salir | F para pantalla completa
      </div>
    </div>
  );
};

export default PresentationMode;

