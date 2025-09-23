# AI Room Image Generation System

This guide explains how to use the AI-powered room image generation system integrated into the Schiehallion Hotel website.

## Overview

The system allows you to:
- Generate professional room images using AI (Google Gemini)
- Manage and organize generated images by room type
- Seamlessly integrate generated images into the hotel website
- Control which images are displayed to guests

## Features

### 1. AI Image Generation
- **Room Types**: Standard, Deluxe, Suite, Family, Accessible
- **Styles**: Photorealistic, Artistic, Cinematic
- **Custom Prompts**: Override default descriptions with custom prompts
- **Auto-save**: Automatically save generated images to the website

### 2. Image Management
- **Gallery System**: Organize images by room type
- **Active/Inactive Control**: Choose which images appear on the website
- **File Storage**: Images saved to `/public/images/rooms/generated/`
- **Metadata Tracking**: Track generation date, style, and prompts

### 3. Website Integration
- **Room Cards**: Generated images automatically appear in room listings
- **AI Badge**: Visual indicator when rooms have AI-generated images
- **Image Carousel**: Browse through original and generated images
- **Seamless Fallback**: System gracefully handles missing images

## Getting Started

### Prerequisites

1. **API Key**: Ensure `GEMINI_API_KEY` is set in your environment variables
```bash
GEMINI_API_KEY=your-api-key-here
```

2. **Permissions**: Ensure the application can write to the `public/images/rooms/generated/` directory

### Accessing the Admin Panel

1. Navigate to your website
2. Look for the "⚙️ Admin" link in the navigation bar
3. Click to access the admin dashboard
4. Select "Room Images" to manage AI-generated images

### Generating Your First Image

1. **Go to Admin Panel**: Navigate to `/admin/room-images`
2. **Select Room Type**: Choose from Standard, Deluxe, Suite, Family, or Accessible
3. **Choose Style**: Select Photorealistic, Artistic, or Cinematic
4. **Add Custom Prompt** (Optional): Describe specific features you want
5. **Enable Auto-save**: Check the box to automatically save to gallery
6. **Generate**: Click "Generate Image" and wait 10-30 seconds
7. **Activate**: Once generated, click "Activate" to display on website

### Managing Images

#### Viewing Images by Room Type
- Select different room types from the dropdown
- View all generated images for that type
- See generation date, style, and prompt for each image

#### Activating/Deactivating Images
- **Activate**: Makes image visible on the website room cards
- **Deactivate**: Hides image from website but keeps in gallery
- Only active images appear to website visitors

#### Deleting Images
- Click "Delete" to permanently remove an image
- This removes both the file and the gallery record
- **Warning**: This action cannot be undone

## Technical Architecture

### Components

1. **Image Generation Service** (`/src/services/imageGenerationService.ts`)
   - Handles API calls to Google Gemini
   - Manages image generation requests
   - Provides browser download functionality

2. **Room Image Management Service** (`/src/services/roomImageManagementService.ts`)
   - Coordinates between generation and storage
   - Manages gallery metadata in localStorage
   - Handles image activation/deactivation

3. **API Routes**
   - `/api/generate-image`: Generate images using Gemini AI
   - `/api/room-images/save`: Save images to file system
   - `/api/room-images/list`: List images for a room type
   - `/api/room-images/delete`: Delete image files

4. **Admin Interface** (`/src/components/admin/RoomImageAdmin.tsx`)
   - Full-featured admin panel for image management
   - Generation controls and gallery management
   - Statistics and overview dashboard

5. **Website Integration**
   - Enhanced `RoomCard` component with AI image support
   - Custom React hooks for image data management
   - Automatic integration with existing room service

### File Storage Structure
```
public/
  images/
    rooms/
      generated/
        standard/
          standard-photorealistic-1234567890-abc123.png
        deluxe/
          deluxe-cinematic-1234567890-def456.png
        suite/
        family/
        accessible/
```

### Data Flow

1. **Generation Request**: Admin selects room type and style
2. **AI Processing**: Request sent to Google Gemini API
3. **Image Return**: Base64 image data returned
4. **File Storage**: Image saved to public directory
5. **Gallery Update**: Metadata stored in localStorage
6. **Website Display**: Active images appear in room listings

## Troubleshooting

### Common Issues

**Images not generating**
- Check that `GEMINI_API_KEY` is properly set
- Verify internet connection
- Check browser console for error messages

**Images not appearing on website**
- Ensure images are activated in the admin panel
- Check that files exist in `/public/images/rooms/generated/`
- Verify room service is including generated images

**Admin panel not accessible**
- Check that you're navigating to `/admin` or `/admin/room-images`
- Ensure the navigation component is properly imported

**File permission errors**
- Ensure write permissions for `public/images/rooms/generated/`
- Check that directories are created automatically

### Debugging

**Enable Debug Logging**
```javascript
// Add to your browser console
localStorage.setItem('debug-room-images', 'true')
```

**Check Gallery Data**
```javascript
// View current gallery data
console.log(JSON.parse(localStorage.getItem('room-images-gallery') || '[]'))
```

**Clear Gallery Data** (if needed)
```javascript
// Reset gallery (will not delete files)
localStorage.removeItem('room-images-gallery')
```

## Best Practices

### Image Generation
- **Start Simple**: Use default prompts before trying custom ones
- **Test Styles**: Try different styles to see what works best
- **Quality Check**: Review images before activating them
- **Consistent Branding**: Maintain consistent style across room types

### Management
- **Regular Cleanup**: Remove unused or low-quality images
- **Backup Important Images**: Download favorites before deleting
- **Monitor Usage**: Check admin dashboard statistics regularly
- **User Testing**: Get feedback on image quality and relevance

### Performance
- **Limit Active Images**: Don't activate too many images per room type
- **Optimize File Sizes**: Generated PNGs can be large
- **Monitor Storage**: Keep an eye on disk usage
- **Cache Management**: Images are cached by browsers

## Future Enhancements

Potential improvements to consider:
- Bulk image generation for all room types
- Advanced prompt templates and presets
- Image editing and filtering capabilities
- Integration with content management systems
- Automated image optimization and compression
- A/B testing for image effectiveness
- Analytics on image engagement
- Integration with booking conversion tracking

## Support

For technical support or feature requests:
1. Check the browser console for error messages
2. Review this guide for troubleshooting steps
3. Check the admin dashboard for system statistics
4. Test with different room types and styles

---

**Note**: This system requires an active Google Gemini API key and internet connection for image generation. Generated images are stored locally and become part of your website's static assets.