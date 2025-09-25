'use client';

import React, { useState } from 'react';
import RoomImageGenerator from './RoomImageGenerator';
import FoodImageGenerator from './FoodImageGenerator';
import SceneryImageGenerator from './SceneryImageGenerator';
import { type GeneratedImage } from '@/services/imageGenerationService';

type ActiveTab = 'rooms' | 'food' | 'scenery';

interface ImageGenerationDashboardProps {
  className?: string;
}

export default function ImageGenerationDashboard({ className = '' }: ImageGenerationDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rooms');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const tabs = [
    { id: 'rooms' as const, label: 'Hotel Rooms', icon: '🏨', description: 'Generate hotel room images' },
    { id: 'food' as const, label: 'Restaurant Food', icon: '🍽️', description: 'Generate food and dish images' },
    { id: 'scenery' as const, label: 'Highland Scenery', icon: '🏔️', description: 'Generate landscape images' }
  ];

  const handleImageGenerated = (image: GeneratedImage) => {
    setGeneratedImages(prev => [image, ...prev]);
  };

  const handleClearHistory = () => {
    setGeneratedImages([]);
  };

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Image Generation Studio
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate high-quality images for your hotel using Gemini AI. Create stunning visuals for rooms, food, and highland scenery.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {tab.description}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Panel */}
        <div className="lg:col-span-2">
          {activeTab === 'rooms' && (
            <RoomImageGenerator onImageGenerated={handleImageGenerated} />
          )}
          {activeTab === 'food' && (
            <FoodImageGenerator onImageGenerated={handleImageGenerated} />
          )}
          {activeTab === 'scenery' && (
            <SceneryImageGenerator onImageGenerated={handleImageGenerated} />
          )}
        </div>

        {/* History Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Images ({generatedImages.length})
              </h3>
              {generatedImages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Clear All
                </button>
              )}
            </div>

            {generatedImages.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No images generated yet</p>
                <p className="text-xs mt-1">Start generating images to see them here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {generatedImages.map((image) => (
                  <div key={image.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    {/* Thumbnail */}
                    <div className="aspect-video mb-3 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={`data:${image.mimeType};base64,${image.imageData}`}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {image.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {image.generatedAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                        {image.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
              How to use the Image Generator
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Choose between room, food, or scenery generation tabs</li>
              <li>• Use quick select options or enter custom descriptions</li>
              <li>• Select your preferred style and composition</li>
              <li>• Generated images can be downloaded for use on your website</li>
              <li>• Images are powered by Google Gemini AI for high quality results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}