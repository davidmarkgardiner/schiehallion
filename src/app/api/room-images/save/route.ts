import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, mimeType, roomType, filename } = body;

    // Validate required fields
    if (!imageData || !mimeType || !roomType || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData, mimeType, roomType, filename' },
        { status: 400 }
      );
    }

    // Ensure the directory exists
    const uploadDir = join(process.cwd(), 'public', 'images', 'rooms', 'generated', roomType);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');
    
    // Create the file path
    const filePath = join(uploadDir, filename);
    const relativePath = `/images/rooms/generated/${roomType}/${filename}`;

    // Write the file
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: relativePath,
      filePath: filePath
    });

  } catch (error) {
    console.error('Error saving room image:', error);
    return NextResponse.json(
      {
        error: 'Failed to save image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}