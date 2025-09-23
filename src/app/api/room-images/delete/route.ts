import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomType, filename } = body;

    if (!roomType || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields: roomType, filename' },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), 'public', 'images', 'rooms', 'generated', roomType, filename);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting room image:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}