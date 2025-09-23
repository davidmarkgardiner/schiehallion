export interface ImageGenerationRequest {
  prompt: string
}

export interface ImageGenerationResponse {
  imageUrl: string
  id: string
  metadata: {
    model: string
    dimensions: {
      width: number
      height: number
    }
    generatedAt: Date
  }
}

export interface ImageProcessingRequest {
  imageUrl: string
}

export interface ImageProcessingResponse {
  contentType: string
  data: string
}

export interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  timestamp: Date
  userId?: string
  metadata?: ImageMetadata
}

export interface ImageMetadata {
  model: string
  dimensions: {
    width: number
    height: number
  }
  generatedAt: Date
  prompt?: string
}