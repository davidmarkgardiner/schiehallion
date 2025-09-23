// Image caching service for optimized room image loading
import { RoomType } from '@/types/hotel';

interface CachedImage {
  url: string;
  timestamp: number;
  blob?: Blob;
  preloaded?: boolean;
}

class ImageCacheService {
  private cache = new Map<string, CachedImage>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached images
  private preloadQueue = new Set<string>();

  /**
   * Preload an image and store it in cache
   */
  async preloadImage(url: string): Promise<void> {
    // Skip if already preloaded or in queue
    if (this.cache.has(url) || this.preloadQueue.has(url)) {
      return;
    }

    this.preloadQueue.add(url);

    try {
      // Use Image preloading for better browser caching
      const img = new window.Image();
      img.crossOrigin = 'anonymous';

      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
      });

      img.src = url;
      await loadPromise;

      // Store in cache
      this.cache.set(url, {
        url,
        timestamp: Date.now(),
        preloaded: true
      });

      // Clean cache if it gets too large
      this.cleanCache();
    } catch (error) {
      console.warn('Failed to preload image:', url, error);
    } finally {
      this.preloadQueue.delete(url);
    }
  }

  /**
   * Preload multiple images for a room type
   */
  async preloadRoomImages(roomType: RoomType, imageUrls: string[]): Promise<void> {
    // Preload first 3 images immediately, rest in background
    const immediateUrls = imageUrls.slice(0, 3);
    const backgroundUrls = imageUrls.slice(3);

    // Preload immediate images
    await Promise.all(immediateUrls.map(url => this.preloadImage(url)));

    // Preload background images with delay
    backgroundUrls.forEach((url, index) => {
      setTimeout(() => {
        this.preloadImage(url);
      }, (index + 1) * 1000); // Stagger by 1 second
    });
  }

  /**
   * Check if image is cached and still valid
   */
  isCached(url: string): boolean {
    const cached = this.cache.get(url);
    if (!cached) return false;

    // Check if cache is still valid
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(url);
      return false;
    }

    return true;
  }

  /**
   * Get optimized image URL with query parameters for caching
   */
  getOptimizedUrl(url: string, width?: number, height?: number): string {
    try {
      // For local images, we can use them directly without optimization
      if (url.startsWith('/images/rooms/') && !url.includes('localhost')) {
        // Add cache busting parameter based on day to refresh daily
        const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        urlObj.searchParams.set('v', dayOfYear.toString());
        return urlObj.toString();
      }

      // Check if this is a generated room image that can be optimized
      if (url.includes('/images/rooms/generated/')) {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const roomType = urlParts[urlParts.length - 2];

        // Use our optimization API route
        const optimizeUrl = new URL('/api/room-images/optimize', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        optimizeUrl.searchParams.set('roomType', roomType);
        optimizeUrl.searchParams.set('filename', filename);

        if (width) optimizeUrl.searchParams.set('width', width.toString());
        if (height) optimizeUrl.searchParams.set('height', height.toString());
        optimizeUrl.searchParams.set('quality', '85'); // Good balance of quality/size

        return optimizeUrl.toString();
      }

      // For other images, add cache busting and basic optimization
      const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

      if (width) urlObj.searchParams.set('w', width.toString());
      if (height) urlObj.searchParams.set('h', height.toString());

      // Add cache busting parameter based on day to refresh daily
      const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      urlObj.searchParams.set('v', dayOfYear.toString());

      return urlObj.toString();
    } catch (error) {
      console.warn('Failed to create optimized URL, using original:', error);
      return url;
    }
  }

  /**
   * Clean expired entries from cache
   */
  private cleanCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remove expired entries
    for (const [url, cached] of entries) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(url);
      }
    }

    // If still too large, remove oldest entries
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.cache.size - this.MAX_CACHE_SIZE);

      for (const [url] of sortedEntries) {
        this.cache.delete(url);
      }
    }
  }

  /**
   * Clear all cached images
   */
  clearCache(): void {
    this.cache.clear();
    this.preloadQueue.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    cacheSize: number;
    preloadQueueSize: number;
    totalMemoryUsage: number;
  } {
    return {
      cacheSize: this.cache.size,
      preloadQueueSize: this.preloadQueue.size,
      totalMemoryUsage: this.cache.size * 100 // Rough estimate in KB
    };
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();
export default ImageCacheService;