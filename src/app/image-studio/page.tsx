'use client';

import React from 'react';
import ImageGenerationDashboard from '@/components/image-generation/ImageGenerationDashboard';
import SiteNavigation from '@/components/navigation/SiteNavigation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Restaurant', href: '/restaurant' },
  { label: 'Booking', href: '/booking' },
];

export default function ImageStudioPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Schiehallion Hotel</h1>
            <p className="text-slate-400">Please sign in to access the AI Image Studio</p>
          </div>
          <LoginForm />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <SiteNavigation
              sectionLinks={navLinks}
              actionSlot={
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    AI Image Studio
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                    BETA
                  </span>
                </div>
              }
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <span className="text-6xl mr-4">🎨</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  AI Image Studio
                </h1>
                <p className="text-xl md:text-2xl text-purple-100">
                  Powered by Google Gemini AI
                </p>
              </div>
            </div>
            <p className="text-lg text-purple-100 max-w-3xl mx-auto mt-6">
              Generate stunning, high-quality images for your hotel marketing and website content.
              Create beautiful room photos, appetizing food images, and breathtaking highland scenery
              using the latest AI technology.
            </p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Hotel Rooms
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate inviting room images showcasing different styles, from standard doubles to luxury suites.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Restaurant Food
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create appetizing food photography for menus, featuring Scottish cuisine and international dishes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏔️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Highland Scenery
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate stunning landscape images of Scottish Highlands, lochs, and mountains for marketing materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <ImageGenerationDashboard />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Simple steps to create professional-quality images
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Choose Category
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select between rooms, food, or scenery generation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Describe Your Vision
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use our guided prompts or write your own description
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Choose Style
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pick from photorealistic, artistic, or cinematic styles
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Generate & Download
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI creates your image and you can download it instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Schiehallion Hotel · AI Image Studio powered by Google Gemini
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-400">
              <span>✓ High-quality AI generation</span>
              <span>✓ Instant downloads</span>
              <span>✓ Commercial use ready</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}