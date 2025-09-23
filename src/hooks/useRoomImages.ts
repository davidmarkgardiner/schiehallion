'use client';

import { useState, useEffect } from 'react';
import { RoomType } from '@/types/hotel';
import { roomImageManagementService, type StoredRoomImage } from '@/services/roomImageManagementService';

interface UseRoomImagesOptions {
  roomType?: RoomType;
  includeInactive?: boolean;
}

interface UseRoomImagesReturn {
  images: StoredRoomImage[];
  activeImages: StoredRoomImage[];
  loading: boolean;
  error: string | null;
  refreshImages: () => Promise<void>;
  getImagesForType: (type: RoomType) => StoredRoomImage[];
  getAllActiveImageUrls: () => Record<RoomType, string[]>;
}

export function useRoomImages(options: UseRoomImagesOptions = {}): UseRoomImagesReturn {
  const [images, setImages] = useState<StoredRoomImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshImages = async () => {
    if (!options.roomType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const roomImages = await roomImageManagementService.getImagesForRoomType(options.roomType);
      setImages(roomImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const getImagesForType = (type: RoomType): StoredRoomImage[] => {
    return images.filter(img => img.roomType === type);
  };

  const getAllActiveImageUrls = (): Record<RoomType, string[]> => {
    const activeImages = roomImageManagementService.getActiveImagesForRoomTypes();
    
    // Ensure all room types have an entry even if empty
    const roomTypes: RoomType[] = ['standard', 'deluxe', 'suite', 'family', 'accessible'];
    roomTypes.forEach(type => {
      if (!activeImages[type]) {
        activeImages[type] = [];
      }
    });
    
    return activeImages;
  };

  // Load images when roomType changes
  useEffect(() => {
    if (options.roomType) {
      refreshImages();
    }
  }, [options.roomType]);

  const activeImages = images.filter(img => img.isActive);
  const displayImages = options.includeInactive ? images : activeImages;

  return {
    images: displayImages,
    activeImages,
    loading,
    error,
    refreshImages,
    getImagesForType,
    getAllActiveImageUrls
  };
}

// Hook specifically for getting all active room images for room display
export function useActiveRoomImages(): {
  imagesByRoomType: Record<RoomType, string[]>;
  hasImages: (roomType: RoomType) => boolean;
  getImageCount: (roomType: RoomType) => number;
  isLoading: boolean;
  error: string | null;
} {
  const [imagesByRoomType, setImagesByRoomType] = useState<Record<RoomType, string[]>>({} as Record<RoomType, string[]>);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load active images on mount and set up periodic refresh
    const loadActiveImages = async () => {
      try {
        setError(null);
        
        // Get images from localStorage gallery first
        const activeImages = roomImageManagementService.getActiveImagesForRoomTypes();
        setImagesByRoomType(activeImages);

        // Also try to fetch from API for any new images
        const roomTypes: RoomType[] = ['standard', 'deluxe', 'suite', 'family', 'accessible'];
        const updatedImagesByRoomType = { ...activeImages };

        for (const roomType of roomTypes) {
          try {
            const response = await fetch(`/api/room-images/list?roomType=${roomType}`);
            if (response.ok) {
              const { images } = await response.json();
              if (images.length > 0) {
                // Use the API images directly since they exist in the file system
                const imageUrls = images.map((img: any) => img.url);
                updatedImagesByRoomType[roomType] = imageUrls;
              } else {
                // If no images from API, ensure the array is empty
                updatedImagesByRoomType[roomType] = [];
              }
            }
          } catch (err) {
            // Silently continue for individual room type failures
            console.warn(`Failed to fetch images for ${roomType}:`, err);
          }
        }

        // Update state with images from API
        setImagesByRoomType(updatedImagesByRoomType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setIsLoading(false);
      }
    };

    loadActiveImages();

    // Refresh every 60 seconds (reduced frequency for better performance)
    const interval = setInterval(loadActiveImages, 60000);

    return () => clearInterval(interval);
  }, []);

  const hasImages = (roomType: RoomType): boolean => {
    return (imagesByRoomType[roomType]?.length || 0) > 0;
  };

  const getImageCount = (roomType: RoomType): number => {
    return imagesByRoomType[roomType]?.length || 0;
  };

  return {
    imagesByRoomType,
    hasImages,
    getImageCount,
    isLoading,
    error
  };
}