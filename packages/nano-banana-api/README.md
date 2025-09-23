# Nano Banana Image Generation API

A reusable Node.js package for AI-powered image generation using Google's Gemini 2.5 Flash model. Perfect for generating contextual images for hotel rooms, restaurant dishes, product descriptions, and more.

## Features

- **AI Image Generation**: Uses Google Gemini 2.5 Flash Image Preview model
- **Base64 & URL Support**: Handles both data URLs and HTTP/HTTPS image URLs
- **Error Handling**: Comprehensive error handling with content policy detection
- **Safety Filters**: Automatic detection of content blocked by safety filters
- **Hotel/Restaurant Ready**: Perfect for generating images of rooms, food, amenities

## Installation

1. Copy the `packages/nano-banana-api` folder to your project
2. Install dependencies:
```bash
npm install @google/generative-ai
```

## Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional - Models (uses defaults if not set)
GEMINI_MODEL=gemini-2.5-flash-image-preview
```

## Usage

### Basic Image Generation API

```typescript
// pages/api/generate-image.ts or app/api/generate-image/route.ts
import { handleImageGeneration } from './packages/nano-banana-api'

export async function POST(request: Request) {
  return handleImageGeneration(request)
}
```

### Image Processing API (Base64/URL)

```typescript
// pages/api/process-image.ts or app/api/process-image/route.ts
import { handleImageProcessing } from './packages/nano-banana-api'

export async function POST(request: Request) {
  return handleImageProcessing(request)
}
```

### Frontend Usage

```typescript
// Generate image from text prompt
const generateImage = async (prompt: string) => {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })

  const data = await response.json()
  return data.imageUrl // Base64 data URL ready for display
}

// Process existing image (convert URL to base64)
const processImage = async (imageUrl: string) => {
  const response = await fetch('/api/process-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl })
  })

  const data = await response.json()
  return `data:${data.contentType};base64,${data.data}`
}

// Usage examples
const hotelRoomImage = await generateImage("Luxury double bedroom with king size bed, marble bathroom, city view, modern furnishing")
const restaurantDishImage = await generateImage("Grilled salmon fillet with roasted vegetables and lemon herb sauce, plated elegantly")
```

## API Reference

### Image Generation Request

```typescript
interface ImageGenerationRequest {
  prompt: string // 3-500 characters
}

interface ImageGenerationResponse {
  imageUrl: string // Base64 data URL
  id: string // Unique identifier
  metadata: {
    model: string
    dimensions: { width: number; height: number }
    generatedAt: Date
  }
}
```

### Image Processing Request

```typescript
interface ImageProcessingRequest {
  imageUrl: string // Data URL or HTTP/HTTPS URL
}

interface ImageProcessingResponse {
  contentType: string // MIME type
  data: string // Base64 encoded data
}
```

## Hotel & Restaurant Examples

### Hotel Room Types

```typescript
const roomPrompts = {
  single: "Cozy single bedroom with twin bed, modern amenities, warm lighting, city view",
  double: "Spacious double bedroom with queen bed, elegant furniture, ensuite bathroom",
  suite: "Luxury presidential suite with living area, marble bathroom, panoramic views",
  family: "Family room with bunk beds and double bed, colorful decor, kid-friendly amenities"
}

// Generate images for all room types
const roomImages = await Promise.all(
  Object.entries(roomPrompts).map(async ([type, prompt]) => ({
    type,
    image: await generateImage(prompt)
  }))
)
```

### Restaurant Dishes

```typescript
const dishPrompts = {
  appetizer: "Fresh bruschetta with tomatoes and basil, artfully plated on white ceramic",
  steak: "Perfectly grilled ribeye steak with roasted potatoes and seasonal vegetables",
  seafood: "Pan-seared halibut with quinoa pilaf and citrus reduction",
  dessert: "Chocolate lava cake with vanilla ice cream and fresh berries"
}

// Generate menu images
const menuImages = await Promise.all(
  Object.entries(dishPrompts).map(async ([dish, prompt]) => ({
    dish,
    image: await generateImage(prompt)
  }))
)
```

### Dynamic Generation Based on User Input

```typescript
// For a hotel booking system
const generateRoomImage = async (roomType: string, amenities: string[], view: string) => {
  const prompt = `${roomType} hotel room with ${amenities.join(', ')}, ${view} view, professional hotel photography style`
  return await generateImage(prompt)
}

// For a restaurant menu
const generateDishImage = async (dishName: string, ingredients: string[], cuisine: string) => {
  const prompt = `${dishName} made with ${ingredients.join(', ')}, ${cuisine} cuisine style, professional food photography`
  return await generateImage(prompt)
}

// Usage
const roomImage = await generateRoomImage("deluxe suite", ["king bed", "jacuzzi", "balcony"], "ocean")
const dishImage = await generateDishImage("pasta carbonara", ["pancetta", "parmesan", "eggs"], "Italian")
```

## Error Handling

The package includes comprehensive error handling:

```typescript
try {
  const image = await generateImage(prompt)
  // Success - use image
} catch (error) {
  if (error.message.includes('safety filters')) {
    // Content was blocked - try different prompt
  } else if (error.message.includes('quota')) {
    // API quota exceeded - try again later
  } else {
    // Other error - handle appropriately
  }
}
```

## Customization

### Model Configuration

```typescript
// In your environment variables
GEMINI_MODEL=gemini-2.5-flash-image-preview // Default
GEMINI_MODEL=gemini-1.5-pro-vision // Alternative model
```

### Prompt Enhancement

You can enhance prompts automatically:

```typescript
const enhanceHotelPrompt = (basePrompt: string) => {
  return `${basePrompt}, professional hotel photography, high quality, well-lit, inviting atmosphere`
}

const enhanceRestaurantPrompt = (basePrompt: string) => {
  return `${basePrompt}, professional food photography, appetizing presentation, restaurant quality plating`
}
```

### Content Policy Guidelines

For best results with hotel/restaurant content:

✅ **Good prompts:**
- "Elegant hotel lobby with marble floors and modern furniture"
- "Gourmet pasta dish with fresh ingredients"
- "Cozy restaurant interior with warm lighting"

❌ **Avoid:**
- Overly specific brand names
- Copyrighted content
- Inappropriate or suggestive content

## Integration Tips

1. **Caching**: Consider caching generated images to avoid regenerating the same content
2. **Fallbacks**: Have fallback images ready in case generation fails
3. **User Feedback**: Allow users to regenerate if they're not satisfied with results
4. **Batch Processing**: Generate multiple variations and let users choose

## License

MIT License