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
    <nav
      className={`rounded-3xl border border-lundies-stone/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-semibold text-lundies-charcoal dark:text-neutral-100">
          <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-lundies-linen/80 text-sm text-lundies-charcoal shadow-sm dark:bg-neutral-800 dark:text-neutral-100">
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
              className={`rounded-2xl border p-4 transition-colors ${
                isActive
                  ? 'border-lundies-stone/60 bg-lundies-linen/90 text-lundies-charcoal shadow-sm dark:border-neutral-600 dark:bg-neutral-800'
                  : 'border-lundies-stone/40 bg-white/70 text-lundies-peat/80 hover:bg-lundies-ivory/80 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="mb-2 flex items-center text-lundies-charcoal dark:text-neutral-100">
                <span className="mr-3 text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              <p className="text-sm text-lundies-peat/80 dark:text-neutral-300">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}