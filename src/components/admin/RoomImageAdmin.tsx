'use client';

import React, { useState, useEffect } from 'react';
import { RoomType } from '@/types/hotel';
import { roomImageManagementService, type StoredRoomImage } from '@/services/roomImageManagementService';

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
      <div className="rounded-3xl border border-lundies-stone/60 bg-white/95 p-6 shadow-lg shadow-lundies-stone/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lundies-heather/20 text-2xl">🎨</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lundies-moss">Creative control</p>
              <h1 className="text-2xl font-semibold text-lundies-charcoal">Room Image Admin</h1>
              <p className="text-sm text-lundies-peat">Generate and manage AI-powered room images</p>
            </div>
          </div>

          {stats && (
            <div className="text-right text-sm text-lundies-peat">
              <p className="text-3xl font-semibold text-lundies-charcoal">{stats.totalImages}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-lundies-moss">Total images</p>
              <p className="text-xs text-lundies-peat">{stats.activeImages} active placements</p>
            </div>
          )}
        </div>

        {/* Room Type Selector */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <label htmlFor="roomTypeSelect" className="text-sm font-medium text-lundies-peat">
            Room type
          </label>
          <select
            id="roomTypeSelect"
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value as RoomType)}
            className="w-full max-w-xs rounded-lg border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal shadow-sm focus:border-lundies-heather focus:outline-none focus:ring-2 focus:ring-lundies-heather"
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {error && (
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-lundies-peat/40 bg-lundies-peat/15 px-4 py-3 text-sm text-lundies-peat">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-lundies-heather/40 bg-lundies-heather/15 px-4 py-3 text-sm text-lundies-heather">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}
          </div>
          <button
            onClick={clearMessages}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-lundies-stone/60 text-lundies-peat transition hover:border-lundies-heather hover:text-lundies-heather"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-3xl border border-lundies-stone/60 bg-white/95 p-6 shadow-lg shadow-lundies-stone/30">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-lundies-charcoal">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generate New Image
            </h2>

            <div className="space-y-4">
              {/* Style Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-lundies-peat">
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
                        className="text-lundies-heather focus:ring-lundies-heather"
                      />
                      <span className="ml-2 text-sm capitalize text-lundies-charcoal">
                        {style}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label htmlFor="customPrompt" className="mb-2 block text-sm font-medium text-lundies-peat">
                  Custom Prompt (Optional)
                </label>
                <textarea
                  id="customPrompt"
                  value={generationForm.customPrompt}
                  onChange={(e) => setGenerationForm(prev => ({ ...prev, customPrompt: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal shadow-sm focus:border-lundies-heather focus:outline-none focus:ring-2 focus:ring-lundies-heather"
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
                  className="rounded text-lundies-heather focus:ring-lundies-heather"
                />
                <label htmlFor="autoSave" className="ml-2 text-sm text-lundies-peat">
                  Auto-save to gallery
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex w-full items-center justify-center rounded-lg bg-lundies-heather px-4 py-3 text-sm font-medium text-white transition hover:bg-lundies-heather/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="rounded-3xl border border-lundies-stone/60 bg-white/95 shadow-lg shadow-lundies-stone/30">
            <div className="flex flex-col gap-3 border-b border-lundies-stone/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center text-lg font-semibold text-lundies-charcoal">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {roomTypes.find(rt => rt.value === selectedRoomType)?.label} Images ({images.length})
              </h2>
              <button
                onClick={loadImages}
                disabled={isLoading}
                className="rounded-full border border-lundies-stone/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lundies-peat transition hover:border-lundies-heather hover:text-lundies-heather disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-lundies-peat">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-lundies-heather border-t-transparent" />
                  <span>Loading images…</span>
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="text-6xl">📸</div>
                  <h3 className="text-lg font-semibold text-lundies-charcoal">No images yet</h3>
                  <p className="max-w-sm text-sm text-lundies-peat">
                    Generate your first image for {roomTypes.find(rt => rt.value === selectedRoomType)?.label.toLowerCase()} rooms to populate the gallery.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {images.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-2xl border border-lundies-stone/60 bg-white/95 shadow-sm">
                      <div className="aspect-video bg-lundies-linen/70">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden h-full w-full items-center justify-center text-lundies-peat">
                          <div className="text-center">
                            <svg className="mx-auto mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-xs">Image not found</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              image.isActive
                                ? 'bg-lundies-heather/15 text-lundies-heather'
                                : 'bg-lundies-linen/80 text-lundies-peat'
                            }`}
                          >
                            {image.isActive ? '✓ Active' : 'Inactive'}
                          </span>
                          <span className="text-xs capitalize text-lundies-peat">{image.style}</span>
                        </div>

                        <p className="line-clamp-2 text-sm text-lundies-peat">{image.prompt}</p>

                        <div className="text-xs text-lundies-peat/80">Generated: {image.generatedAt.toLocaleDateString()}</div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(image.id, !image.isActive)}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                              image.isActive
                                ? 'bg-lundies-sand/30 text-lundies-peat hover:bg-lundies-sand/40'
                                : 'bg-lundies-heather/20 text-lundies-heather hover:bg-lundies-heather/30'
                            }`}
                          >
                            {image.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="rounded-lg px-3 py-2 text-xs font-medium text-lundies-peat transition hover:bg-lundies-peat/15"
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
        <div className="rounded-3xl border border-lundies-stone/60 bg-white/95 p-6 shadow-lg shadow-lundies-stone/30">
          <h2 className="mb-4 flex items-center text-lg font-semibold text-lundies-charcoal">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Gallery statistics
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-lundies-stone/60 bg-lundies-linen/80 p-4 text-center">
              <p className="text-3xl font-semibold text-lundies-charcoal">{stats.totalImages}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-lundies-moss">Total images</p>
            </div>
            <div className="rounded-2xl border border-lundies-stone/60 bg-lundies-linen/80 p-4 text-center">
              <p className="text-3xl font-semibold text-lundies-charcoal">{stats.activeImages}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-lundies-moss">Active placements</p>
            </div>
            <div className="rounded-2xl border border-lundies-stone/60 bg-lundies-linen/80 p-4 text-center">
              <p className="text-3xl font-semibold text-lundies-charcoal">{Object.keys(stats.imagesByRoomType).length}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-lundies-moss">Room archetypes</p>
            </div>
            <div className="rounded-2xl border border-lundies-stone/60 bg-lundies-linen/80 p-4 text-center">
              <p className="text-3xl font-semibold text-lundies-charcoal">{Object.keys(stats.imagesByStyle).length}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-lundies-moss">Visual styles</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}