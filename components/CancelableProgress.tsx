import React from 'react';

interface CancelableProgressProps {
  message: string;
  progress?: number;
  total?: number;
  onCancel?: () => void;
}

const CancelableProgress: React.FC<CancelableProgressProps> = ({
  message,
  progress,
  total,
  onCancel,
}) => {
  const percentage = progress && total ? Math.round((progress / total) * 100) : undefined;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-700">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{message}</h3>
          
          {percentage !== undefined && (
            <div className="mb-4">
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm">{percentage}%</p>
              {progress !== undefined && total !== undefined && (
                <p className="text-gray-400 text-sm mt-1">{progress} de {total}</p>
              )}
            </div>
          )}
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancelableProgress;

