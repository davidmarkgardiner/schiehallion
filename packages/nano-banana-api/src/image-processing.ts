import { NextRequest, NextResponse } from 'next/server'
import type { ImageProcessingRequest, ImageProcessingResponse } from './types'

export async function handleImageProcessing(request: NextRequest | Request) {
  try {
    const body = (await request.json()) as ImageProcessingRequest
    const imageUrl = body.imageUrl?.trim()

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    // Handle data URLs (base64 encoded images)
    if (imageUrl.startsWith('data:')) {
      const dataUrlRegex = /^data:([^;]+);base64,(.+)$/
      const match = imageUrl.match(dataUrlRegex)

      if (!match) {
        return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 })
      }

      const [, contentType, base64Data] = match
      const responseData: ImageProcessingResponse = {
        contentType,
        data: base64Data
      }
      return NextResponse.json(responseData)
    }

    // Handle HTTP/HTTPS URLs
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return NextResponse.json({ error: 'imageUrl must be a data URL or absolute HTTP/HTTPS URL' }, { status: 400 })
    }

    const response = await fetch(imageUrl)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
    const arrayBuffer = await response.arrayBuffer()
    const data = Buffer.from(arrayBuffer).toString('base64')

    const responseData: ImageProcessingResponse = {
      contentType,
      data
    }
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}

// Helper function to validate image URLs
export function isValidImageUrl(url: string): boolean {
  if (!url) return false

  // Check for data URLs
  if (url.startsWith('data:')) {
    return /^data:image\/[a-zA-Z]+;base64,/.test(url)
  }

  // Check for HTTP/HTTPS URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return false
}

// Helper function to get image dimensions from data URL (requires browser environment)
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('getImageDimensions requires browser environment'))
      return
    }

    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    img.src = dataUrl
  })
}