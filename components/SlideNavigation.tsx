import React from 'react';

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
}

/**
 * Componente de navegación entre slides
 * Muestra el número actual y botones de navegación
 * @param props - Props del componente
 */
const SlideNavigation: React.FC<SlideNavigationProps> = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onPrev}
        disabled={disabled}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &larr; Prev
      </button>
      <span className="text-gray-300 font-medium">
        {currentSlide + 1} / {totalSlides}
      </span>
      <button
        onClick={onNext}
        disabled={disabled}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next &rarr;
      </button>
    </div>
  );
};

export default SlideNavigation;

