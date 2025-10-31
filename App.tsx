
import React, { useState, useCallback } from 'react';
import { Slide, SlideContent } from './types';
import { generateSlideContent, generateImageForSlide } from './services/geminiService';
import SlideGeneratorForm from './components/SlideGeneratorForm';
import SlideViewer from './components/SlideViewer';
import LoadingOverlay from './components/LoadingOverlay';

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSlides = useCallback(async (script: string) => {
    if (!script.trim()) {
      setError('Please provide a script or topic.');
      return;
    }
    
    setIsLoading(true);
    setSlides([]);
    setError(null);

    try {
      setLoadingMessage('Step 1/2: Designing slide layouts...');
      const slideContents: SlideContent[] = await generateSlideContent(script);

      if (!slideContents || slideContents.length === 0) {
        throw new Error("Could not generate slide content. The topic might be too short or ambiguous.");
      }

      setLoadingMessage('Step 2/2: Generating images...');
      const generatedSlides: Slide[] = [];
      const imageSlidesCount = slideContents.filter(s => s.layout === 'text-image' && s.imagePrompt).length;
      let imagesGenerated = 0;

      for (const content of slideContents) {
        const newSlide: Slide = { ...content };

        if (content.layout === 'text-image' && content.imagePrompt) {
          imagesGenerated++;
          setLoadingMessage(`Step 2/2: Generating image ${imagesGenerated} of ${imageSlidesCount}...`);
          
          const detailedImagePrompt = `${content.imagePrompt}, professional presentation slide image, clean background, 16:9 aspect ratio, digital illustration`;
          const imageUrl = await generateImageForSlide(detailedImagePrompt);
          newSlide.imageUrl = imageUrl;
        }

        generatedSlides.push(newSlide);
      }

      setSlides(generatedSlides);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);
  
  const handleReset = () => {
    setSlides([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI Slide Generator
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Turn your script into a stunning presentation in seconds.
        </p>
      </header>

      <main className="w-full flex-grow flex flex-col items-center">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 w-full max-w-3xl" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {slides.length === 0 ? (
          <SlideGeneratorForm onGenerate={handleGenerateSlides} isLoading={isLoading} />
        ) : (
          <SlideViewer slides={slides} onReset={handleReset} />
        )}
      </main>

      <footer className="w-full max-w-5xl text-center mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
