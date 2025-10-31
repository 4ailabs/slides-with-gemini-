import React from 'react';
import { Slide as SlideType } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';

interface SlideListProps {
  slides: SlideType[];
  currentSlide: number;
  onSlideClick: (index: number) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}

interface SortableSlideItemProps {
  slide: SlideType;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  id: string;
}

const SortableSlideItem: React.FC<SortableSlideItemProps> = memo(({ slide, index, isActive, onClick, onDuplicate, onDelete, id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 mb-2 rounded-lg border-2 cursor-move transition-all ${
        isActive
          ? 'border-purple-500 bg-purple-500/20'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div 
          onClick={onClick}
          className="flex-1 cursor-pointer"
        >
          <div className="text-white text-sm font-semibold mb-1">
            Slide {index + 1}: {slide.title.substring(0, 30)}...
          </div>
          <div className="text-gray-400 text-xs">{slide.layout}</div>
        </div>
        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="px-2 py-1 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
            title="Duplicar"
          >
            Duplicar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            title="Eliminar"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
});

/**
 * Componente que muestra la lista de slides ordenable
 * Permite reordenar, duplicar y eliminar slides
 * @param props - Props del componente
 */
const SlideList: React.FC<SlideListProps> = ({
  slides,
  currentSlide,
  onSlideClick,
  onDragEnd,
  onDuplicate,
  onDelete,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-40 overflow-y-auto p-4">
      <h3 className="text-white font-bold text-lg mb-4">Lista de Slides</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={slides.map((_, i) => `slide-${i}`)} strategy={verticalListSortingStrategy}>
          {slides.map((slide, index) => (
            <SortableSlideItem
              key={`slide-${index}`}
              id={`slide-${index}`}
              slide={slide}
              index={index}
              isActive={index === currentSlide}
              onClick={() => onSlideClick(index)}
              onDuplicate={() => onDuplicate(index)}
              onDelete={() => onDelete(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SlideList;

