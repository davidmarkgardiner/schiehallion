'use client';

import AdminNav from '@/components/admin/AdminNav';
import RoomImageAdmin from '@/components/admin/RoomImageAdmin';

export default function RoomImagesAdminPage() {
  return (
    <div className="min-h-screen bg-lundies-linen/80 pb-16 pt-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <header className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lundies-moss">Schiehallion Imaging Studio</p>
          <h1 className="text-4xl font-semibold text-lundies-charcoal">Room Image Management</h1>
          <p className="max-w-2xl text-sm text-lundies-peat">
            Generate, curate, and activate AI-powered imagery from within the same warm neutral palette as the public booking
            experience.
          </p>
        </header>

        <AdminNav className="rounded-3xl border border-lundies-stone/60 bg-white/95 p-6 shadow-lg shadow-lundies-stone/30" />

        <RoomImageAdmin />
      </div>
    </div>
  );
}