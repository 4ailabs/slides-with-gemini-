
import React, { useState, useCallback, useEffect } from 'react';
import { Slide as SlideType } from '../types';
import Slide from './Slide';

interface SlideViewerProps {
  slides: SlideType[];
  onReset: () => void;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ slides, onReset }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="w-full max-w-5xl flex flex-col items-center">
      <div className="w-full mb-4">
        <Slide slide={slides[currentSlide]} />
      </div>

      <div className="w-full flex justify-between items-center mt-4">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          Start Over
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={prevSlide}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            &larr; Prev
          </button>
          <span className="text-gray-300 font-medium">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={nextSlide}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideViewer;
