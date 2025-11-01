import React, { useState } from 'react';
import { SlideContent } from '../types';
import { Edit2, Check, X, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ProposalPreviewProps {
  proposal: SlideContent[];
  onApprove: (editedProposal: SlideContent[]) => void;
  onReject: () => void;
  isLoading?: boolean;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  proposal,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [editedProposal, setEditedProposal] = useState<SlideContent[]>(proposal);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'content' | 'imagePrompt' | null>(null);
  const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null);

  // Normalizar content para soportar tanto strings como ContentPoints
  const normalizePoint = (point: string | { text: string; icon?: string }) => {
    return typeof point === 'string' ? point : point.text;
  };
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Propuesta de Presentación
          </h2>
          <button
            onClick={onReject}
            className="text-gray-400 hover:text-white transition-colors p-1"
            disabled={isLoading}
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-blue-200 text-sm">
              Revisa la propuesta de {proposal.length} slide(s). Puedes aprobar para generar las slides finales con imágenes, o rechazar para volver al formulario.
            </p>
          </div>

          <div className="space-y-4">
            {editedProposal.map((slide, index) => (
              <div
                key={index}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400 font-bold text-sm">
                        Slide {index + 1}
                      </span>
                      <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                        {slide.layout}
                      </span>
                    </div>
                    {editingIndex === index && editingField === 'title' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const updated = [...editedProposal];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setEditedProposal(updated);
                          }}
                          onBlur={() => {
                            setEditingIndex(null);
                            setEditingField(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingIndex(null);
                              setEditingField(null);
                            }
                          }}
                          className="flex-1 px-2 py-1 bg-gray-800 border border-purple-500 rounded text-white font-semibold text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                        <Check className="w-5 h-5 text-green-400 mb-2" />
                      </div>
                    ) : (
                      <h3
                        className="text-white font-semibold text-lg mb-2 cursor-pointer hover:text-purple-400 transition-colors flex items-center gap-2 group"
                        onClick={() => {
                          setEditingIndex(index);
                          setEditingField('title');
                        }}
                        title="Haz clic para editar"
                      >
                        <span>{slide.title}</span>
                        <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                    )}
                  </div>
                </div>

                {slide.content && slide.content.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {slide.content.map((point, pointIndex) => {
                      const pointText = normalizePoint(point);
                      return (
                        <li key={pointIndex} className="text-gray-300 text-sm flex items-start gap-2">
                          <span>•</span>
                          {editingIndex === index && editingField === 'content' && editingContentIndex === pointIndex ? (
                            <div className="flex items-start gap-2 flex-1">
                              <textarea
                                value={pointText}
                                onChange={(e) => {
                                  const updated = [...editedProposal];
                                  const updatedContent = [...updated[index].content];
                                  // Convertir a formato normalizado si es necesario
                                  if (typeof updatedContent[pointIndex] === 'string') {
                                    updatedContent[pointIndex] = e.target.value;
                                  } else {
                                    updatedContent[pointIndex] = { ...updatedContent[pointIndex] as { text: string; icon?: string }, text: e.target.value };
                                  }
                                  updated[index] = { ...updated[index], content: updatedContent };
                                  setEditedProposal(updated);
                                }}
                                onBlur={() => {
                                  setEditingIndex(null);
                                  setEditingField(null);
                                  setEditingContentIndex(null);
                                }}
                                className="flex-1 px-2 py-1 bg-gray-800 border border-purple-500 rounded text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                rows={2}
                                autoFocus
                              />
                              <Check className="w-4 h-4 text-green-400 mt-1" />
                            </div>
                          ) : (
                            <span
                              className="flex-1 cursor-pointer hover:text-purple-400 transition-colors group/item flex items-center gap-2"
                              onClick={() => {
                                setEditingIndex(index);
                                setEditingField('content');
                                setEditingContentIndex(pointIndex);
                              }}
                              title="Haz clic para editar"
                            >
                              <span>{pointText}</span>
                              <Edit2 className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {slide.layout === 'text-image' && slide.imagePrompt && (
                  <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-600">
                    <p className="text-gray-400 text-xs mb-1 font-semibold">
                      Prompt para imagen:
                    </p>
                    {editingIndex === index && editingField === 'imagePrompt' ? (
                      <div className="flex items-start gap-2">
                        <textarea
                          value={slide.imagePrompt}
                          onChange={(e) => {
                            const updated = [...editedProposal];
                            updated[index] = { ...updated[index], imagePrompt: e.target.value };
                            setEditedProposal(updated);
                          }}
                          onBlur={() => {
                            setEditingIndex(null);
                            setEditingField(null);
                          }}
                          className="flex-1 px-2 py-1 bg-gray-900 border border-purple-500 rounded text-gray-300 text-sm italic focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows={2}
                          autoFocus
                        />
                        <Check className="w-4 h-4 text-green-400 mt-1" />
                      </div>
                    ) : (
                      <p
                        className="text-gray-300 text-sm italic cursor-pointer hover:text-purple-400 transition-colors group/prompt flex items-center gap-2"
                        onClick={() => {
                          setEditingIndex(index);
                          setEditingField('imagePrompt');
                        }}
                        title="Haz clic para editar"
                      >
                        <ImageIcon className="w-4 h-4 opacity-50" />
                        <span>{slide.imagePrompt}</span>
                        <Edit2 className="w-3 h-3 opacity-0 group-hover/prompt:opacity-100 transition-opacity" />
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Rechazar
          </button>
          <button
            onClick={() => onApprove(editedProposal)}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin">⟳</span>
                Generando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Aprobar y Generar Slides
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalPreview;

