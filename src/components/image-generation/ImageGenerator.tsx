'use client';

import React, { useState } from 'react';
import { imageGenerationService, type ImageCategory, type GeneratedImage } from '@/services/imageGenerationService';

interface ImageGeneratorProps {
  category: ImageCategory;
  onImageGenerated?: (image: GeneratedImage) => void;
  className?: string;
}

export default function ImageGenerator({ category, onImageGenerated, className = '' }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'photorealistic' | 'artistic' | 'cinematic'>('photorealistic');
  const [size, setSize] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const image = await imageGenerationService.generateImage({
        category,
        prompt: prompt.trim(),
        style,
        size
      });

      setGeneratedImage(image);
      onImageGenerated?.(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      imageGenerationService.saveImageToFile(generatedImage);
    }
  };

  const handleClear = () => {
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate {category} Image
        </h3>

        {/* Prompt Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={`Describe the ${category} you want to generate...`}
            />
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Style
            </label>
            <div className="flex space-x-4">
              {(['photorealistic', 'artistic', 'cinematic'] as const).map((styleOption) => (
                <label key={styleOption} className="flex items-center">
                  <input
                    type="radio"
                    name="style"
                    value={styleOption}
                    checked={style === styleOption}
                    onChange={(e) => setStyle(e.target.value as typeof style)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {styleOption}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aspect Ratio
            </label>
            <div className="flex space-x-4">
              {(['landscape', 'portrait', 'square'] as const).map((sizeOption) => (
                <label key={sizeOption} className="flex items-center">
                  <input
                    type="radio"
                    name="size"
                    value={sizeOption}
                    checked={size === sizeOption}
                    onChange={(e) => setSize(e.target.value as typeof size)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {sizeOption}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex space-x-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </button>

            {generatedImage && (
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Error generating image
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Image Display */}
      {generatedImage && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Image
            </h3>
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              Download
            </button>
          </div>

          <div className="space-y-4">
            {/* Image */}
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={imageGenerationService.getImageDataUrl(generatedImage)}
                alt={generatedImage.prompt}
                className="w-full h-auto"
              />
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Prompt:</strong> {generatedImage.prompt}</p>
              <p><strong>Style:</strong> {generatedImage.metadata?.style}</p>
              <p><strong>Size:</strong> {generatedImage.metadata?.size}</p>
              <p><strong>Generated:</strong> {generatedImage.generatedAt.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}