import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get('roomType');

    if (!roomType) {
      return NextResponse.json(
        { error: 'roomType parameter is required' },
        { status: 400 }
      );
    }

    const imageDir = join(process.cwd(), 'public', 'images', 'rooms', 'generated', roomType);
    
    if (!existsSync(imageDir)) {
      return NextResponse.json({ images: [] });
    }

    const files = await readdir(imageDir);
    const imageFiles = files.filter(file => 
      file.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
    );

    const images = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = join(imageDir, file);
        const stats = await stat(filePath);
        
        return {
          filename: file,
          url: `/images/rooms/generated/${roomType}/${file}`,
          createdAt: stats.birthtime,
          size: stats.size
        };
      })
    );

    // Sort by creation date (newest first)
    images.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ images });

  } catch (error) {
    console.error('Error listing room images:', error);
    return NextResponse.json(
      {
        error: 'Failed to list images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}