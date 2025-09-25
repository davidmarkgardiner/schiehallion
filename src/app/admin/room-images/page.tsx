'use client';

import RoomImageAdmin from '@/components/admin/RoomImageAdmin';
import AdminNav from '@/components/admin/AdminNav';

export default function RoomImagesAdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Room Image Management</h1>
            <p className="text-slate-300">Generate and manage AI-powered room images</p>
          </div>

          {/* Navigation */}
          <AdminNav />

          {/* Main Content */}
          <RoomImageAdmin />
        </div>
      </div>
    </div>
  );
}