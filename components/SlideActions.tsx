import React from 'react';

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
}) => {
  if (!isEditMode) {
    return (
      <button
        onClick={onToggleEdit}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
      >
        Modo Edición
      </button>
    );
  }

  return (
    <>
      <button
        onClick={onToggleEdit}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
      >
        Salir de Edición
      </button>
      <button
        onClick={onShowSlideList}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        {showSlideList ? 'Ocultar' : 'Mostrar'} Lista
      </button>
      <button
        onClick={onShowEditPanel}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
      >
        Personalizar
      </button>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Deshacer (Ctrl/Cmd+Z)"
      >
        Deshacer
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Rehacer (Ctrl/Cmd+Shift+Z)"
      >
        Rehacer
      </button>
      <button
        onClick={onDuplicate}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
        title="Duplicar slide actual"
      >
        Duplicar Slide
      </button>
    </>
  );
};

export default SlideActions;

