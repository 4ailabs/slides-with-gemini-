import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Image, FileType, Presentation, Save, FolderOpen } from 'lucide-react';

interface ExportMenuProps {
  onExportPDF: () => void;
  onExportPPTX: () => void;
  onExportImages: () => void;
  onExportCurrentSlide: () => void;
  onStartPresentation: () => void;
  onSave: () => void;
  onLoad: () => void;
  isDownloading: boolean;
  disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportPDF,
  onExportPPTX,
  onExportImages,
  onExportCurrentSlide,
  onStartPresentation,
  onSave,
  onLoad,
  isDownloading,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isDownloading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span>Exportar / Más</span>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 overflow-hidden">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-700">
              Exportar
            </div>
            
            <button
              onClick={() => {
                onExportCurrentSlide();
                setIsOpen(false);
              }}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              Slide Actual
            </button>
            
            <button
              onClick={() => {
                onExportImages();
                setIsOpen(false);
              }}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              Todas las Imágenes
            </button>
            
            <button
              onClick={() => {
                onExportPDF();
                setIsOpen(false);
              }}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            
            <button
              onClick={() => {
                onExportPPTX();
                setIsOpen(false);
              }}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileType className="w-4 h-4" />
              PowerPoint
            </button>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-t border-b border-gray-700 mt-1">
              Presentación
            </div>
            
            <button
              onClick={() => {
                onStartPresentation();
                setIsOpen(false);
              }}
              disabled={disabled || isDownloading}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Presentation className="w-4 h-4" />
              Modo Presentación
            </button>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-t border-gray-700 mt-1">
              Guardar / Cargar
            </div>
            
            <button
              onClick={() => {
                onSave();
                setIsOpen(false);
              }}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Presentación
            </button>
            
            <button
              onClick={() => {
                onLoad();
                setIsOpen(false);
              }}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Cargar Presentación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;

