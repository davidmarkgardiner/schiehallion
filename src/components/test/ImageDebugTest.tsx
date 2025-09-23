'use client'

import { useState, useEffect } from 'react'
import { RoomImage } from '@/components/ui/image-fallback'

export default function ImageDebugTest() {
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/room-images/list?roomType=standard')
        if (response.ok) {
          const { images } = await response.json()
          const urls = images.map((img: any) => img.url)
          setImageUrls(urls)
          console.log('Fetched image URLs:', urls)
        }
      } catch (error) {
        console.error('Error fetching images:', error)
      }
    }

    fetchImages()
  }, [])

  return (
    <div className="p-8 space-y-8 bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white">Image Debug Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl text-white">Fetched Image URLs:</h2>
        <ul className="text-slate-300">
          {imageUrls.map((url, index) => (
            <li key={index}>{url}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl text-white">Image Display Test:</h2>
        {imageUrls.map((url, index) => (
          <div key={index} className="space-y-2">
            <p className="text-slate-300">Image {index + 1}:</p>
            <div className="w-80 h-48">
              <RoomImage
                src={url}
                alt={`Test image ${index + 1}`}
                roomType="standard"
                roomNumber="101"
                hasAIImages={true}
                isAIEnhanced={true}
                onGenerateRoom={() => console.log('Generate image clicked')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}