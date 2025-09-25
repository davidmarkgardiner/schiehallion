'use client';

import React, { useState, useEffect } from 'react';
import { RoomType } from '@/types/hotel';
import { roomImageManagementService, type StoredRoomImage } from '@/services/roomImageManagementService';
import { imageGenerationService, type GeneratedImage } from '@/services/imageGenerationService';

interface RoomImageAdminProps {
  className?: string;
}

export default function RoomImageAdmin({ className = '' }: RoomImageAdminProps) {
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('standard');
  const [images, setImages] = useState<StoredRoomImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generationForm, setGenerationForm] = useState({
    style: 'photorealistic' as 'photorealistic' | 'artistic' | 'cinematic',
    customPrompt: '',
    autoSave: true
  });
  const [stats, setStats] = useState<any>(null);

  const roomTypes: { value: RoomType; label: string }[] = [
    { value: 'standard', label: 'Standard Room' },
    { value: 'deluxe', label: 'Deluxe Room' },
    { value: 'suite', label: 'Suite' },
    { value: 'family', label: 'Family Room' },
    { value: 'accessible', label: 'Accessible Room' }
  ];

  // Load images for selected room type
  useEffect(() => {
    loadImages();
  }, [selectedRoomType]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const roomImages = await roomImageManagementService.getImagesForRoomType(selectedRoomType);
      setImages(roomImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = () => {
    try {
      const galleryStats = roomImageManagementService.getGalleryStats();
      setStats(galleryStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await roomImageManagementService.generateRoomImage({
        roomType: selectedRoomType,
        style: generationForm.style,
        customPrompt: generationForm.customPrompt || undefined,
        autoSave: generationForm.autoSave
      });

      if (result.storedImage) {
        setSuccess(`Image generated and saved successfully! Filename: ${result.storedImage.filename}`);
        await loadImages(); // Refresh the list
        loadStats(); // Refresh stats
      } else {
        setSuccess('Image generated successfully! Use the "Save to Gallery" button to save it.');
      }

      // Reset form
      setGenerationForm(prev => ({ ...prev, customPrompt: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleActive = async (imageId: string, isActive: boolean) => {
    try {
      await roomImageManagementService.setImageActive(imageId, isActive);
      await loadImages(); // Refresh the list
      loadStats(); // Refresh stats
      setSuccess(`Image ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update image status');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      await roomImageManagementService.deleteImage(imageId);
      await loadImages(); // Refresh the list
      loadStats(); // Refresh stats
      setSuccess('Image deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
              🎨
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Image Admin</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate and manage AI-powered room images</p>
            </div>
          </div>
          
          {stats && (
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{stats.totalImages}</div>
              <div className="text-xs text-gray-500">Total Images</div>
              <div className="text-sm text-green-600">{stats.activeImages} active</div>
            </div>
          )}
        </div>

        {/* Room Type Selector */}
        <div className="flex items-center space-x-4">
          <label htmlFor="roomTypeSelect" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Room Type:
          </label>
          <select
            id="roomTypeSelect"
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value as RoomType)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {roomTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className="flex items-center justify-between">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex-1 mr-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-800 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex-1 mr-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-800 dark:text-green-400">{success}</span>
              </div>
            </div>
          )}
          <button
            onClick={clearMessages}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generate New Image
            </h2>

            <div className="space-y-4">
              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Style
                </label>
                <div className="space-y-2">
                  {(['photorealistic', 'artistic', 'cinematic'] as const).map((style) => (
                    <label key={style} className="flex items-center">
                      <input
                        type="radio"
                        name="style"
                        value={style}
                        checked={generationForm.style === style}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, style: e.target.value as any }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {style}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Prompt (Optional)
                </label>
                <textarea
                  id="customPrompt"
                  value={generationForm.customPrompt}
                  onChange={(e) => setGenerationForm(prev => ({ ...prev, customPrompt: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Describe specific room features or atmosphere..."
                />
              </div>

              {/* Auto Save */}
              <div className="flex items-center">
                <input
                  id="autoSave"
                  type="checkbox"
                  checked={generationForm.autoSave}
                  onChange={(e) => setGenerationForm(prev => ({ ...prev, autoSave: e.target.checked }))}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <label htmlFor="autoSave" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Auto-save to gallery
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {roomTypes.find(rt => rt.value === selectedRoomType)?.label} Images ({images.length})
                </h2>
                <button
                  onClick={loadImages}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-gray-500 dark:text-gray-400">Loading images...</div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📸</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Images Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Generate your first image for {roomTypes.find(rt => rt.value === selectedRoomType)?.label.toLowerCase()} rooms
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-sm">Image not found</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            image.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {image.isActive ? '✓ Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {image.style}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {image.prompt}
                        </p>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                          Generated: {image.generatedAt.toLocaleDateString()}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleActive(image.id, !image.isActive)}
                            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md ${
                              image.isActive
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                            }`}
                          >
                            {image.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="px-3 py-2 text-xs font-medium text-red-800 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Gallery Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalImages}</div>
              <div className="text-sm text-blue-600">Total Images</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.activeImages}</div>
              <div className="text-sm text-green-600">Active Images</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.imagesByRoomType).length}</div>
              <div className="text-sm text-purple-600">Room Types</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{Object.keys(stats.imagesByStyle).length}</div>
              <div className="text-sm text-orange-600">Styles Used</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}