// Image Generation Service using Google Gemini AI
// Handles generation of hotel rooms, food, and highland scenery images

import { GoogleGenerativeAI } from "@google/generative-ai";

export type ImageCategory = 'room' | 'food' | 'scenery';

export interface ImageGenerationRequest {
  category: ImageCategory;
  prompt: string;
  style?: 'photorealistic' | 'artistic' | 'cinematic';
  size?: 'landscape' | 'portrait' | 'square';
}

export interface GeneratedImage {
  id: string;
  category: ImageCategory;
  prompt: string;
  imageData: string; // Base64 encoded image data
  mimeType: string;
  generatedAt: Date;
  metadata?: {
    style?: string;
    size?: string;
    [key: string]: any;
  };
}

class ImageGenerationService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isClientSide: boolean;

  constructor() {
    this.isClientSide = typeof window !== 'undefined';

    if (this.isClientSide) {
      // On client side, we'll use the API route instead of direct access
      console.log('ImageGenerationService initialized for client-side use (API route)');
    } else {
      // Server-side initialization
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
    }
  }

  /**
   * Generate an image based on the request parameters
   */
  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    try {
      if (this.isClientSide) {
        // Use API route on client side
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate image');
        }

        const data = await response.json();
        return {
          ...data.image,
          generatedAt: new Date(data.image.generatedAt)
        };
      } else {
        // Direct API call on server side
        if (!this.model) {
          throw new Error('Model not initialized');
        }

        const enhancedPrompt = this.enhancePrompt(request);

        const result = await this.model.generateContent(enhancedPrompt);
        const response = result.response;

        // Find the image part in the response
        const imagePart = response.candidates[0]?.content?.parts?.find(
          (part: any) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
        );

        if (!imagePart) {
          throw new Error('No image was generated in the response');
        }

        const generatedImage: GeneratedImage = {
          id: this.generateImageId(),
          category: request.category,
          prompt: request.prompt,
          imageData: imagePart.inlineData.data,
          mimeType: imagePart.inlineData.mimeType,
          generatedAt: new Date(),
          metadata: {
            style: request.style,
            size: request.size,
            enhancedPrompt
          }
        };

        return generatedImage;
      }
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a hotel room image
   */
  async generateRoomImage(
    roomType: string,
    style: 'photorealistic' | 'artistic' | 'cinematic' = 'photorealistic',
    customPrompt?: string
  ): Promise<GeneratedImage> {
    const basePrompt = customPrompt || this.getRoomPrompt(roomType);

    return this.generateImage({
      category: 'room',
      prompt: basePrompt,
      style,
      size: 'landscape'
    });
  }

  /**
   * Generate a food/dish image
   */
  async generateFoodImage(
    dishName: string,
    cuisine: string = 'Scottish',
    style: 'photorealistic' | 'artistic' | 'cinematic' = 'photorealistic',
    customPrompt?: string
  ): Promise<GeneratedImage> {
    const basePrompt = customPrompt || this.getFoodPrompt(dishName, cuisine);

    return this.generateImage({
      category: 'food',
      prompt: basePrompt,
      style,
      size: 'square'
    });
  }

  /**
   * Generate a highland scenery image
   */
  async generateSceneryImage(
    location: string,
    timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'sunset' | 'night' = 'afternoon',
    weather: 'clear' | 'cloudy' | 'misty' | 'stormy' = 'clear',
    customPrompt?: string
  ): Promise<GeneratedImage> {
    const basePrompt = customPrompt || this.getSceneryPrompt(location, timeOfDay, weather);

    return this.generateImage({
      category: 'scenery',
      prompt: basePrompt,
      style: 'cinematic',
      size: 'landscape'
    });
  }

  /**
   * Save generated image to a file (for development/testing)
   */
  saveImageToFile(image: GeneratedImage, filename?: string): string {
    if (typeof window !== 'undefined') {
      // Client-side: create download link
      // Convert base64 to blob without using Buffer (browser compatibility)
      const binaryString = atob(image.imageData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: image.mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${image.category}-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return filename || `${image.category}-${image.id}.png`;
    } else {
      // Server-side: would need fs module
      throw new Error('File saving not implemented for server-side');
    }
  }

  /**
   * Convert generated image to data URL for display
   */
  getImageDataUrl(image: GeneratedImage): string {
    return `data:${image.mimeType};base64,${image.imageData}`;
  }

  // Private helper methods

  private enhancePrompt(request: ImageGenerationRequest): string {
    const { category, prompt, style, size } = request;

    let enhancedPrompt = prompt;

    // Add style modifiers
    if (style === 'photorealistic') {
      enhancedPrompt += ', professional photography, high resolution, sharp details, realistic lighting';
    } else if (style === 'artistic') {
      enhancedPrompt += ', artistic composition, beautiful lighting, aesthetic, elegant';
    } else if (style === 'cinematic') {
      enhancedPrompt += ', cinematic photography, dramatic lighting, film quality, atmospheric';
    }

    // Add size/composition hints
    if (size === 'landscape') {
      enhancedPrompt += ', wide angle composition, landscape orientation';
    } else if (size === 'portrait') {
      enhancedPrompt += ', vertical composition, portrait orientation';
    } else if (size === 'square') {
      enhancedPrompt += ', square composition, centered subject';
    }

    // Add category-specific quality markers
    if (category === 'room') {
      enhancedPrompt += ', luxury hotel interior, welcoming atmosphere, pristine condition';
    } else if (category === 'food') {
      enhancedPrompt += ', food photography, appetizing presentation, professional plating';
    } else if (category === 'scenery') {
      enhancedPrompt += ', natural beauty, breathtaking landscape, Scottish Highlands';
    }

    return enhancedPrompt;
  }

  private getRoomPrompt(roomType: string): string {
    const prompts = {
      'standard': 'A comfortable standard hotel room with a double bed, modern furnishings, warm lighting, mountain view through the window, Scottish Highland hotel interior design',
      'deluxe': 'An elegant deluxe hotel room with king bed, luxury furnishings, sitting area, panoramic Highland views, premium Scottish hotel interior',
      'suite': 'A luxurious hotel suite with separate living area, premium furnishings, fireplace, multiple Highland mountain views, upscale Scottish hospitality design',
      'family': 'A spacious family hotel room with multiple beds, child-friendly amenities, bright natural lighting, Highland views, welcoming family atmosphere',
      'accessible': 'An accessible hotel room with wheelchair-friendly design, wide doorways, accessible bathroom, comfortable furnishings, Highland views'
    };

    return prompts[roomType as keyof typeof prompts] || prompts['standard'];
  }

  private getFoodPrompt(dishName: string, cuisine: string): string {
    return `A beautifully plated ${dishName} from ${cuisine} cuisine, artfully presented on elegant dinnerware, restaurant-quality plating, appetizing and fresh, professional food photography lighting`;
  }

  private getSceneryPrompt(location: string, timeOfDay: string, weather: string): string {
    const timeDescriptors: Record<string, string> = {
      'dawn': 'at dawn with soft golden light',
      'morning': 'in the morning with bright natural light',
      'afternoon': 'in the afternoon with clear bright lighting',
      'sunset': 'at sunset with warm golden hour lighting',
      'night': 'at night with moonlight and stars'
    };

    const weatherDescriptors: Record<string, string> = {
      'clear': 'under clear skies',
      'cloudy': 'with dramatic clouds',
      'misty': 'with atmospheric mist and fog',
      'stormy': 'with dramatic stormy weather'
    };

    const timeDesc = timeDescriptors[timeOfDay] || timeDescriptors['afternoon'];
    const weatherDesc = weatherDescriptors[weather] || weatherDescriptors['clear'];

    return `Breathtaking Scottish Highland landscape of ${location} ${timeDesc} ${weatherDesc}, majestic mountains, pristine natural beauty, dramatic scenery`;
  }

  private generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Export singleton instance
export const imageGenerationService = new ImageGenerationService();

// Export class for testing or custom instances
export default ImageGenerationService;