'use client';

import React, { useState } from 'react';
import { imageGenerationService, type GeneratedImage } from '@/services/imageGenerationService';

interface FoodImageGeneratorProps {
  onImageGenerated?: (image: GeneratedImage) => void;
  className?: string;
}

export default function FoodImageGenerator({ onImageGenerated, className = '' }: FoodImageGeneratorProps) {
  const [dishName, setDishName] = useState('');
  const [cuisine, setCuisine] = useState('Scottish');
  const [style, setStyle] = useState<'photorealistic' | 'artistic' | 'cinematic'>('photorealistic');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cuisineTypes = [
    'Scottish',
    'British',
    'French',
    'Italian',
    'Mediterranean',
    'International',
    'Seafood',
    'Vegetarian',
    'Vegan'
  ];

  const popularDishes = [
    'Haggis with neeps and tatties',
    'Fresh Scottish salmon',
    'Beef Wellington',
    'Cullen skink',
    'Highland venison',
    'Whisky-glazed lamb',
    'Smoked haddock',
    'Scottish tablet dessert',
    'Cranachan',
    'Shortbread'
  ];

  const handleGenerate = async () => {
    if (!dishName.trim()) {
      setError('Please enter a dish name');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const image = await imageGenerationService.generateFoodImage(
        dishName.trim(),
        cuisine,
        style,
        customPrompt || undefined
      );

      setGeneratedImage(image);
      onImageGenerated?.(image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDishSelect = (dish: string) => {
    setDishName(dish);
  };

  const handleDownload = () => {
    if (generatedImage) {
      const filename = `food-${dishName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      imageGenerationService.saveImageToFile(generatedImage, filename);
    }
  };

  const handleClear = () => {
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Empty State Placeholder - Show when no image generated */}
      {!generatedImage && !isGenerating && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 mb-6">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Food Image Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create mouth-watering AI-generated food images for your restaurant menu</p>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-4">
              <p className="text-xs text-orange-700 dark:text-orange-300">🍽️ Generate appetizing, professional food photography in seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
            🍽️
          </span>
          {generatedImage ? 'Generate Another Food Image' : 'Generate Food Image'}
        </h3>

        <div className="space-y-4">
          {/* Popular Dishes Quick Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Select (Popular Dishes)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {popularDishes.map((dish) => (
                <button
                  key={dish}
                  onClick={() => handleDishSelect(dish)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  {dish}
                </button>
              ))}
            </div>
          </div>

          {/* Dish Name Input */}
          <div>
            <label htmlFor="dishName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dish Name *
            </label>
            <input
              type="text"
              id="dishName"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Haggis with neeps and tatties"
            />
          </div>

          {/* Cuisine Type Selection */}
          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cuisine Type
            </label>
            <select
              id="cuisine"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {cuisineTypes.map((cuisineType) => (
                <option key={cuisineType} value={cuisineType}>
                  {cuisineType}
                </option>
              ))}
            </select>
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

          {/* Custom Prompt (Optional) */}
          <div>
            <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Description (Optional)
            </label>
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Override the default food description with your own..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Leave empty to use the default description for the dish and cuisine
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex space-x-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !dishName.trim()}
              className={`px-6 py-3 rounded-md focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium ${
                generatedImage
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Image...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {generatedImage ? '✨ Generate New Image' : '🍽️ Generate Food Image'}
                </>
              )}
            </button>

            {generatedImage && (
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* Progress indicator for generation */}
          {isGenerating && (
            <div className="mt-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 text-orange-500 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-400">Generating your food image...</p>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">Creating appetizing visuals for {dishName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Error generating food image
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
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                ✅
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Food Image
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ready for menu and marketing use</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PNG
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Image */}
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-inner">
              <img
                src={imageGenerationService.getImageDataUrl(generatedImage)}
                alt={generatedImage.prompt}
                className="w-full h-auto"
              />
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div><strong>Dish:</strong> {dishName}</div>
              <div><strong>Cuisine:</strong> {cuisine}</div>
              <div><strong>Style:</strong> {generatedImage.metadata?.style}</div>
              <div><strong>Generated:</strong> {generatedImage.generatedAt.toLocaleString()}</div>
              <div><strong>Prompt:</strong> {generatedImage.prompt}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}