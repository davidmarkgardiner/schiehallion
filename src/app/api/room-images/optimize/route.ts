import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get('roomType');
    const filename = searchParams.get('filename');
    const width = parseInt(searchParams.get('width') || '400');
    const height = parseInt(searchParams.get('height') || '300');
    const quality = parseInt(searchParams.get('quality') || '80');

    if (!roomType || !filename) {
      return NextResponse.json(
        { error: 'roomType and filename parameters are required' },
        { status: 400 }
      );
    }

    const imagePath = join(process.cwd(), 'public', 'images', 'rooms', 'generated', roomType, filename);

    if (!existsSync(imagePath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    try {
      // Read and optimize the image using sharp
      const imageBuffer = await readFile(imagePath);

      const optimizedBuffer = await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality })
        .toBuffer();

      // Set cache headers
      const response = new NextResponse(optimizedBuffer);
      response.headers.set('Content-Type', 'image/webp');
      response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // 24 hours
      response.headers.set('ETag', `"${filename}-${width}x${height}-${quality}"`);

      return response;
    } catch (sharpError) {
      // Fallback: serve original image if sharp optimization fails
      console.warn('Sharp optimization failed, serving original:', sharpError);

      const imageBuffer = await readFile(imagePath);
      const response = new NextResponse(imageBuffer);

      // Determine content type from filename
      const ext = filename.toLowerCase().split('.').pop();
      const contentType = ext === 'png' ? 'image/png' :
                         ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                         'image/png';

      response.headers.set('Content-Type', contentType);
      response.headers.set('Cache-Control', 'public, max-age=86400');

      return response;
    }

  } catch (error) {
    console.error('Error optimizing room image:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}