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
    <div className="min-h-screen bg-gradient-to-br from-lundies-ivory via-lundies-linen to-lundies-stone text-lundies-charcoal">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm uppercase tracking-[0.35em] text-lundies-peat/70">Manage your AI-powered hotel content</p>
          </div>

          {/* Navigation */}
          <AdminNav />

          {/* Stats Overview */}
          {stats && (
            <div className="rounded-3xl border border-lundies-stone/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-lundies-charcoal dark:text-neutral-100">
                <svg className="h-6 w-6 text-lundies-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                AI Image Gallery Overview
              </h2>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-lundies-stone/40 bg-lundies-ivory/80 p-4 text-center shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70">
                  <div className="mb-1 text-3xl font-semibold text-lundies-charcoal dark:text-neutral-50">{stats.totalImages}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-lundies-peat/70">Total Images</div>
                </div>
                <div className="rounded-2xl border border-lundies-stone/40 bg-lundies-ivory/80 p-4 text-center shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70">
                  <div className="mb-1 text-3xl font-semibold text-lundies-charcoal dark:text-neutral-50">{stats.activeImages}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-lundies-peat/70">Active Images</div>
                </div>
                <div className="rounded-2xl border border-lundies-stone/40 bg-lundies-ivory/80 p-4 text-center shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70">
                  <div className="mb-1 text-3xl font-semibold text-lundies-charcoal dark:text-neutral-50">{Object.keys(stats.imagesByRoomType).length}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-lundies-peat/70">Room Types</div>
                </div>
                <div className="rounded-2xl border border-lundies-stone/40 bg-lundies-ivory/80 p-4 text-center shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70">
                  <div className="mb-1 text-3xl font-semibold text-lundies-charcoal dark:text-neutral-50">{Object.keys(stats.imagesByStyle).length}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-lundies-peat/70">Styles Used</div>
                </div>
              </div>

              {/* Room Type Breakdown */}
              {Object.keys(stats.imagesByRoomType).length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-lundies-peat/70 dark:text-neutral-300/80">
                    Images by Room Type
                  </h3>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {Object.entries(stats.imagesByRoomType).map(([roomType, count]: [string, any]) => (
                      <div
                        key={roomType}
                        className="rounded-xl border border-lundies-stone/40 bg-white/70 p-3 text-center shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70"
                      >
                        <div className="text-lg font-semibold text-lundies-charcoal dark:text-neutral-50">{count}</div>
                        <div className="text-xs font-medium uppercase tracking-[0.25em] text-lundies-peat/70 dark:text-neutral-300/80">
                          {roomType}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Style Breakdown */}
              {Object.keys(stats.imagesByStyle).length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-lundies-peat/70 dark:text-neutral-300/80">
                    Images by Style
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(stats.imagesByStyle).map(([style, count]: [string, any]) => (
                      <div
                        key={style}
                        className="rounded-xl border border-lundies-stone/40 bg-white/70 p-3 text-center shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/70"
                      >
                        <div className="text-lg font-semibold text-lundies-charcoal dark:text-neutral-50">{count}</div>
                        <div className="text-xs font-medium uppercase tracking-[0.25em] text-lundies-peat/70 dark:text-neutral-300/80">
                          {style}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-3xl border border-lundies-stone/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-lundies-charcoal dark:text-neutral-100">
              <svg className="h-6 w-6 text-lundies-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/room-images"
                className="group rounded-2xl border border-lundies-stone/50 bg-lundies-linen/80 p-4 transition-colors hover:bg-lundies-ivory/90 dark:border-neutral-700/60 dark:bg-neutral-900/70 dark:hover:bg-neutral-800"
              >
                <div className="mb-2 flex items-center">
                  <span className="mr-3 text-2xl">🎨</span>
                  <span className="font-medium text-lundies-charcoal dark:text-neutral-100">Generate Room Images</span>
                </div>
                <p className="text-sm text-lundies-peat/80 dark:text-neutral-300">
                  Create AI-powered room photography that matches the Schiehallion palette
                </p>
              </Link>

              <Link
                href="/rooms"
                className="group rounded-2xl border border-lundies-stone/50 bg-white/70 p-4 transition-colors hover:bg-lundies-ivory/80 dark:border-neutral-700/60 dark:bg-neutral-900/70 dark:hover:bg-neutral-800"
              >
                <div className="mb-2 flex items-center">
                  <span className="mr-3 text-2xl">🏨</span>
                  <span className="font-medium text-lundies-charcoal dark:text-neutral-100">View Rooms</span>
                </div>
                <p className="text-sm text-lundies-peat/80 dark:text-neutral-300">Review how curated imagery appears on guest pages</p>
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          {(!stats || stats.totalImages === 0) && (
            <div className="rounded-3xl border border-lundies-stone/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-lundies-charcoal dark:text-neutral-100">
                <svg className="h-6 w-6 text-lundies-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Getting Started
              </h2>

              <div className="rounded-2xl border border-lundies-stone/50 bg-lundies-linen/80 p-4 dark:border-neutral-700/60 dark:bg-neutral-900/70">
                <h3 className="mb-2 font-medium text-lundies-charcoal dark:text-neutral-100">Welcome to AI Room Image Management!</h3>
                <p className="mb-4 text-sm text-lundies-peat/80 dark:text-neutral-300">
                  You haven&apos;t generated any room images yet. Curate your first collection to see it appear across guest journeys.
                </p>
                <div className="space-y-2 text-sm text-lundies-peat/80 dark:text-neutral-300">
                  <div className="flex items-center">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-lundies-charcoal shadow-sm dark:bg-neutral-800 dark:text-neutral-100">1</span>
                    Go to Room Images admin panel
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-lundies-charcoal shadow-sm dark:bg-neutral-800 dark:text-neutral-100">2</span>
                    Select a room type and style
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-lundies-charcoal shadow-sm dark:bg-neutral-800 dark:text-neutral-100">3</span>
                    Generate and activate your images
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-lundies-charcoal shadow-sm dark:bg-neutral-800 dark:text-neutral-100">4</span>
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