import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, prompt, style, size } = body;

    // Validate required fields
    if (!prompt || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and category' },
        { status: 400 }
      );
    }

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    // Enhance the prompt based on parameters
    const enhancedPrompt = enhancePrompt({ category, prompt, style, size });

    // Generate the image
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;

    // Find the image part in the response
    if (!response.candidates || response.candidates.length === 0) {
      return NextResponse.json(
        { error: 'No candidates found in the response' },
        { status: 500 }
      );
    }

    const imagePart = response.candidates[0]?.content?.parts?.find(
      (part: any) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
    );

    if (!imagePart || !imagePart.inlineData) {
      return NextResponse.json(
        { error: 'No image was generated in the response' },
        { status: 500 }
      );
    }

    // Return the generated image data
    return NextResponse.json({
      success: true,
      image: {
        id: generateImageId(),
        category,
        prompt,
        imageData: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
        generatedAt: new Date().toISOString(),
        metadata: {
          style,
          size,
          enhancedPrompt
        }
      }
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function enhancePrompt({ category, prompt, style, size }: {
  category: string;
  prompt: string;
  style?: string;
  size?: string;
}): string {
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

function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}