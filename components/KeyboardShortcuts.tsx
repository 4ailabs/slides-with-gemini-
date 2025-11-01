import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const shortcuts = [
    { keys: ['←', '→'], action: 'Navegar entre slides' },
    { keys: ['Espacio'], action: 'Siguiente slide (en modo presentación)' },
    { keys: ['F'], action: 'Pantalla completa (en modo presentación)' },
    { keys: ['ESC'], action: 'Salir de modo presentación / Cerrar diálogos' },
    { keys: ['Ctrl/Cmd', 'Z'], action: 'Deshacer' },
    { keys: ['Ctrl/Cmd', 'Shift', 'Z'], action: 'Rehacer' },
    { keys: ['E'], action: 'Alternar modo edición' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-purple-400" />
            Atajos de Teclado
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-300">{shortcut.action}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-sm font-mono">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-gray-500 mx-1">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;

