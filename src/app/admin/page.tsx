'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import { roomImageManagementService } from '@/services/roomImageManagementService';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = () => {
      try {
        const galleryStats = roomImageManagementService.getGalleryStats();
        setStats(galleryStats);
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300">Manage your AI-powered hotel content</p>
          </div>

          {/* Navigation */}
          <AdminNav />

          {/* Stats Overview */}
          {stats && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                AI Image Gallery Overview
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalImages}</div>
                  <div className="text-sm text-blue-600 font-medium">Total Images</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.activeImages}</div>
                  <div className="text-sm text-green-600 font-medium">Active Images</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{Object.keys(stats.imagesByRoomType).length}</div>
                  <div className="text-sm text-purple-600 font-medium">Room Types</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{Object.keys(stats.imagesByStyle).length}</div>
                  <div className="text-sm text-orange-600 font-medium">Styles Used</div>
                </div>
              </div>

              {/* Room Type Breakdown */}
              {Object.keys(stats.imagesByRoomType).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Images by Room Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(stats.imagesByRoomType).map(([roomType, count]: [string, any]) => (
                      <div key={roomType} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{count}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{roomType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Style Breakdown */}
              {Object.keys(stats.imagesByStyle).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Images by Style</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(stats.imagesByStyle).map(([style, count]: [string, any]) => (
                      <div key={style} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{count}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{style}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/room-images"
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🎨</span>
                  <span className="font-medium text-blue-900 dark:text-blue-300">Generate Room Images</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">Create stunning AI-powered room photos for your website</p>
              </Link>
              
              <Link
                href="/rooms"
                className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">🏨</span>
                  <span className="font-medium text-green-900 dark:text-green-300">View Rooms</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">See how your AI-generated images look on the website</p>
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          {(!stats || stats.totalImages === 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Getting Started
              </h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Welcome to AI Room Image Management!</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                  You haven't generated any room images yet. Get started by creating your first AI-powered room image.
                </p>
                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                    Go to Room Images admin panel
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                    Select a room type and style
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
                    Generate and activate your images
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-2">4</span>
                    View them live on your rooms page
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}