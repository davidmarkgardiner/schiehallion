// Room Image Management Service
// Handles generation, storage, and management of AI-generated room images

import { imageGenerationService, type GeneratedImage } from './imageGenerationService';
import { imageCacheService } from './imageCache';
import { RoomType } from '@/types/hotel';

export interface StoredRoomImage {
  id: string;
  roomType: RoomType;
  filename: string;
  url: string;
  prompt: string;
  style: 'photorealistic' | 'artistic' | 'cinematic';
  generatedAt: Date;
  isActive: boolean;
  metadata?: {
    width?: number;
    height?: number;
    fileSize?: number;
    [key: string]: any;
  };
}

export interface RoomImageGenerationRequest {
  roomType: RoomType;
  style?: 'photorealistic' | 'artistic' | 'cinematic';
  customPrompt?: string;
  autoSave?: boolean;
}

class RoomImageManagementService {
  private readonly STORAGE_KEY = 'room-images-gallery';
  
  /**
   * Generate and optionally save a room image
   */
  async generateRoomImage(request: RoomImageGenerationRequest): Promise<{
    generatedImage: GeneratedImage;
    storedImage?: StoredRoomImage;
  }> {
    try {
      // Generate the image using existing service
      const generatedImage = await imageGenerationService.generateRoomImage(
        request.roomType,
        request.style || 'photorealistic',
        request.customPrompt
      );

      let storedImage: StoredRoomImage | undefined;
      
      if (request.autoSave) {
        storedImage = await this.saveGeneratedImage(generatedImage, request.roomType);
      }

      return { generatedImage, storedImage };
    } catch (error) {
      console.error('Error generating room image:', error);
      throw new Error(`Failed to generate room image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save a generated image to the file system and update local storage
   */
  async saveGeneratedImage(generatedImage: GeneratedImage, roomType: RoomType): Promise<StoredRoomImage> {
    try {
      const filename = this.generateFilename(roomType, generatedImage.metadata?.style || 'photorealistic');
      
      // Save to file system via API
      const saveResponse = await fetch('/api/room-images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: generatedImage.imageData,
          mimeType: generatedImage.mimeType,
          roomType,
          filename
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save image');
      }

      const { url } = await saveResponse.json();

      // Create stored image record
      const storedImage: StoredRoomImage = {
        id: generatedImage.id,
        roomType,
        filename,
        url,
        prompt: generatedImage.prompt,
        style: (generatedImage.metadata?.style as any) || 'photorealistic',
        generatedAt: generatedImage.generatedAt,
        isActive: false, // Not active by default
        metadata: {
          fileSize: Math.floor(generatedImage.imageData.length * 0.75), // Approximate file size
          mimeType: generatedImage.mimeType
        }
      };

      // Save to local storage gallery
      await this.addToGallery(storedImage);

      return storedImage;
    } catch (error) {
      console.error('Error saving generated image:', error);
      throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all generated images for a specific room type
   */
  async getImagesForRoomType(roomType: RoomType): Promise<StoredRoomImage[]> {
    try {
      // Get from API first (file system)
      const response = await fetch(`/api/room-images/list?roomType=${roomType}`);
      if (!response.ok) {
        console.warn('Failed to fetch images from API, falling back to local storage');
        return this.getGalleryImages().filter(img => img.roomType === roomType);
      }

      const { images } = await response.json();
      
      // Combine with local storage data for metadata
      const galleryImages = this.getGalleryImages();
      
      return images.map((fileImage: any) => {
        const galleryImage = galleryImages.find(gi => gi.filename === fileImage.filename);
        
        return galleryImage || {
          id: `file-${fileImage.filename}`,
          roomType,
          filename: fileImage.filename,
          url: fileImage.url,
          prompt: 'Unknown',
          style: 'photorealistic' as const,
          generatedAt: new Date(fileImage.createdAt),
          isActive: false,
          metadata: {
            fileSize: fileImage.size
          }
        };
      });
    } catch (error) {
      console.error('Error getting images for room type:', error);
      return [];
    }
  }

  /**
   * Get all active images for room types (for use in RoomCard)
   */
  getActiveImagesForRoomTypes(): Record<RoomType, string[]> {
    const galleryImages = this.getGalleryImages();
    const activeImages: Record<string, string[]> = {};

    galleryImages
      .filter(img => img.isActive)
      .forEach(img => {
        if (!activeImages[img.roomType]) {
          activeImages[img.roomType] = [];
        }
        // Use optimized URL from cache service
        const optimizedUrl = typeof window !== 'undefined'
          ? imageCacheService.getOptimizedUrl(img.url, 400, 300)
          : img.url;
        activeImages[img.roomType].push(optimizedUrl);
      });

    return activeImages as Record<RoomType, string[]>;
  }

  /**
   * Set image as active/inactive for room display
   */
  async setImageActive(imageId: string, isActive: boolean): Promise<void> {
    const galleryImages = this.getGalleryImages();
    const imageIndex = galleryImages.findIndex(img => img.id === imageId);
    
    if (imageIndex === -1) {
      throw new Error('Image not found in gallery');
    }

    galleryImages[imageIndex].isActive = isActive;
    this.saveGalleryImages(galleryImages);
  }

  /**
   * Delete a generated image
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const galleryImages = this.getGalleryImages();
      const image = galleryImages.find(img => img.id === imageId);
      
      if (!image) {
        throw new Error('Image not found in gallery');
      }

      // Delete from file system
      const deleteResponse = await fetch('/api/room-images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomType: image.roomType,
          filename: image.filename
        }),
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        console.warn('Failed to delete from file system:', errorData.error);
      }

      // Remove from gallery
      const updatedGallery = galleryImages.filter(img => img.id !== imageId);
      this.saveGalleryImages(updatedGallery);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get gallery images from local storage
   */
  private getGalleryImages(): StoredRoomImage[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((img: any) => ({
        ...img,
        generatedAt: new Date(img.generatedAt)
      }));
    } catch {
      return [];
    }
  }

  /**
   * Save gallery images to local storage
   */
  private saveGalleryImages(images: StoredRoomImage[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Failed to save gallery images:', error);
    }
  }

  /**
   * Add image to gallery
   */
  private async addToGallery(image: StoredRoomImage): Promise<void> {
    const galleryImages = this.getGalleryImages();
    
    // Remove any existing image with the same ID
    const filteredImages = galleryImages.filter(img => img.id !== image.id);
    
    // Add new image
    filteredImages.push(image);
    
    // Sort by generation date (newest first)
    filteredImages.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    
    this.saveGalleryImages(filteredImages);
  }

  /**
   * Generate a unique filename for the image
   */
  private generateFilename(roomType: RoomType, style: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${roomType}-${style}-${timestamp}-${random}.png`;
  }

  /**
   * Clear all gallery data (for testing/reset)
   */
  clearGallery(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Get gallery statistics
   */
  getGalleryStats(): {
    totalImages: number;
    activeImages: number;
    imagesByRoomType: Record<RoomType, number>;
    imagesByStyle: Record<string, number>;
  } {
    const images = this.getGalleryImages();
    
    const stats = {
      totalImages: images.length,
      activeImages: images.filter(img => img.isActive).length,
      imagesByRoomType: {} as Record<RoomType, number>,
      imagesByStyle: {} as Record<string, number>
    };

    images.forEach(img => {
      // Count by room type
      stats.imagesByRoomType[img.roomType] = (stats.imagesByRoomType[img.roomType] || 0) + 1;
      
      // Count by style
      stats.imagesByStyle[img.style] = (stats.imagesByStyle[img.style] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const roomImageManagementService = new RoomImageManagementService();

// Export class for testing
export default RoomImageManagementService;