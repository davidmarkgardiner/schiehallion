'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavProps {
  className?: string;
}

export default function AdminNav({ className = '' }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin/room-images',
      label: 'Room Images',
      icon: '🖼️',
      description: 'Generate and manage AI room images'
    },
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'View system overview'
    },
    {
      href: '/rooms',
      label: 'View Rooms',
      icon: '🏨',
      description: 'See rooms with AI images'
    }
  ];

  return (
    <nav className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 text-sm">
            ⚙️
          </span>
          Admin Panel
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-4 rounded-lg border transition-colors ${
                isActive
                  ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              <p className="text-sm opacity-75">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}