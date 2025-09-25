'use client'

import { RoomImage } from '@/components/ui/image-fallback'
import { RoomImageErrorAlert } from '@/components/ui/room-image-error-alert'

export default function ImageFallbackTest() {
  return (
    <div className="p-8 space-y-8 bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white">Image Fallback Components Test</h1>

      {/* Test RoomImage with no source */}
      <div className="space-y-4">
        <h2 className="text-xl text-white">No Image Source</h2>
        <div className="w-80 h-48">
          <RoomImage
            src={undefined}
            alt="Test room"
            roomType="standard"
            roomNumber="101"
            hasAIImages={false}
            isAIEnhanced={false}
            onGenerateRoom={() => console.log('Generate image clicked')}
          />
        </div>
      </div>

      {/* Test RoomImage with broken source */}
      <div className="space-y-4">
        <h2 className="text-xl text-white">Broken Image Source</h2>
        <div className="w-80 h-48">
          <RoomImage
            src="/images/rooms/nonexistent-image.jpg"
            alt="Test room"
            roomType="deluxe"
            roomNumber="202"
            hasAIImages={true}
            isAIEnhanced={true}
            onGenerateRoom={() => console.log('Generate image clicked')}
          />
        </div>
      </div>

      {/* Test Error Alerts */}
      <div className="space-y-4">
        <h2 className="text-xl text-white">Error Alert Variants</h2>

        <RoomImageErrorAlert
          variant="inline"
          roomType="standard"
          roomNumber="101"
          errorType="missing"
          onGenerateImage={() => console.log('Generate clicked')}
        />

        <RoomImageErrorAlert
          variant="card"
          roomType="suite"
          roomNumber="301"
          errorType="failed"
          onRefresh={() => console.log('Refresh clicked')}
        />

        <RoomImageErrorAlert
          variant="minimal"
          roomType="accessible"
          roomNumber="104"
          errorType="generating"
          isGenerating={true}
        />
      </div>
    </div>
  )
}