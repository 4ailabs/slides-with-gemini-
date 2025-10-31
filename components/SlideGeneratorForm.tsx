
import React, { useState } from 'react';

interface SlideGeneratorFormProps {
  onGenerate: (script: string) => void;
  isLoading: boolean;
}

const SlideGeneratorForm: React.FC<SlideGeneratorFormProps> = ({ onGenerate, isLoading }) => {
  const [script, setScript] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(script);
  };

  return (
    <div className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="script" className="block text-lg font-medium text-gray-300 mb-2">
            Enter your topic or script
          </label>
          <textarea
            id="script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="e.g., The history of space exploration, from the first rockets to future missions to Mars."
            rows={8}
            className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !script.trim()}
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Slides'
          )}
        </button>
      </form>
    </div>
  );
};

export default SlideGeneratorForm;
