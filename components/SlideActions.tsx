import React from 'react';
import { Edit, X, List, Palette, Undo2, Redo2, Copy, Plus } from 'lucide-react';

interface SlideActionsProps {
  isEditMode: boolean;
  onToggleEdit: () => void;
  onShowSlideList: () => void;
  showSlideList: boolean;
  onShowEditPanel: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onAddSlide: () => void;
}

/**
 * Componente que agrupa las acciones principales del editor de slides
 * @param props - Props del componente
 */
const SlideActions: React.FC<SlideActionsProps> = ({
  isEditMode,
  onToggleEdit,
  onShowSlideList,
  showSlideList,
  onShowEditPanel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDuplicate,
  onAddSlide,
}) => {
  if (!isEditMode) {
    return (
      <button
        onClick={onToggleEdit}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
      >
        <Edit className="w-4 h-4" />
        Modo Edición
      </button>
    );
  }

  return (
    <>
      <button
        onClick={onToggleEdit}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Salir de Edición
      </button>
      <button
        onClick={onShowSlideList}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
      >
        <List className="w-4 h-4" />
        {showSlideList ? 'Ocultar' : 'Mostrar'} Lista
      </button>
      <button
        onClick={onShowEditPanel}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
      >
        <Palette className="w-4 h-4" />
        Personalizar
      </button>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        title="Deshacer (Ctrl/Cmd+Z)"
      >
        <Undo2 className="w-4 h-4" />
        Deshacer
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        title="Rehacer (Ctrl/Cmd+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
        Rehacer
      </button>
      <button
        onClick={onDuplicate}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
        title="Duplicar slide actual"
      >
        <Copy className="w-4 h-4" />
        Duplicar Slide
      </button>
      <button
        onClick={onAddSlide}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
        title="Agregar nueva slide"
      >
        <Plus className="w-4 h-4" />
        Nueva Slide
      </button>
    </>
  );
};

export default SlideActions;

