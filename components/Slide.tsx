
import React from 'react';
import { Slide as SlideType } from '../types';

interface SlideProps {
  slide: SlideType;
}

const Slide: React.FC<SlideProps> = ({ slide }) => {

  const Title = ({ className = '' }: { className?: string }) => (
    <h2 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-500 ${className}`}>
      {slide.title}
    </h2>
  );
  
  const Content = () => (
    <ul className="space-y-3 list-disc list-inside text-gray-300 text-base lg:text-xl">
      {slide.content.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  );

  const baseContainerClasses = "w-full aspect-video bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex border border-gray-700";

  switch (slide.layout) {
    case 'title-only':
      return (
        <div className={`${baseContainerClasses} flex-col justify-center items-center text-center p-8 lg:p-12`}>
          <Title className="text-4xl lg:text-7xl" />
        </div>
      );

    case 'text-only':
      return (
        <div className={`${baseContainerClasses} flex-col justify-center items-start p-8 lg:p-12`}>
          <Title className="text-3xl lg:text-5xl mb-6" />
          <Content />
        </div>
      );
      
    case 'text-image':
    default:
      return (
        <div className={baseContainerClasses}>
          <div className="w-1/2 h-full flex flex-col justify-center p-8 lg:p-12 text-white overflow-y-auto">
            <Title className="text-2xl lg:text-4xl mb-4" />
            <Content />
          </div>
          <div className="w-1/2 h-full bg-black">
            {slide.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt={slide.imagePrompt || 'Slide image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <p className="text-gray-400">Image not generated</p>
              </div>
            )}
          </div>
        </div>
      );
  }
};

export default Slide;
