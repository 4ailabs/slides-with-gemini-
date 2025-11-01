import React, { useCallback, useState } from 'react';
import { Upload, RefreshCw, X } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  onRegenerateImage?: () => void;
  onRemoveImage?: () => void;
  isRegenerating?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageChange,
  onRegenerateImage,
  onRemoveImage,
  isRegenerating = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onImageChange(result);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-3">
      {currentImageUrl && (
        <div className="relative group">
          <img
            src={currentImageUrl}
            alt="Current slide image"
            className="w-full h-32 object-cover rounded-lg border-2 border-gray-600"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-medium">Imagen Actual</span>
          </div>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-all ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-300 text-center">
            Arrastra una imagen aquí o
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <span className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              selecciona un archivo
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        {onRegenerateImage && (
          <button
            onClick={onRegenerateImage}
            disabled={isRegenerating}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerando...' : 'Regenerar con IA'}
          </button>
        )}
        {onRemoveImage && currentImageUrl && (
          <button
            onClick={onRemoveImage}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Quitar
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
