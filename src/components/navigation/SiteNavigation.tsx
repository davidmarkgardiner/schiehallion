'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import NavUserProfile from '@/components/NavUserProfile'

interface NavigationLink {
  label: string
  href: string
}

const primaryLinks: NavigationLink[] = [
  { label: 'Overview', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Dining', href: '/restaurant' },
  { label: 'Booking', href: '/booking' },
]

interface SiteNavigationProps {
  actionSlot?: ReactNode
  className?: string
  layout?: 'landing' | 'standard' | 'minimal'
  sectionLinks?: NavigationLink[]
}

const basePrimaryClasses = {
  landing:
    'whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors',
  standard:
    'whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors',
  minimal:
    'whitespace-nowrap border-b px-0 py-2 text-[11px] font-medium uppercase tracking-[0.32em] transition-colors',
} as const

const baseSectionClasses = {
  landing: 'whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors',
  standard:
    'whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors',
  minimal:
    'whitespace-nowrap border-b px-0 py-1 text-[10px] font-medium uppercase tracking-[0.32em] transition-colors',
} as const

const palettes = {
  landing: {
    primary: {
      active: 'bg-lundies-heather/30 text-lundies-charcoal shadow-sm',
      inactive: 'text-lundies-moss hover:bg-lundies-heather/20 hover:text-lundies-charcoal',
    },
    section: 'text-lundies-peat hover:text-lundies-charcoal',
  },
  standard: {
    primary: {
      active: 'bg-lundies-stone text-lundies-charcoal shadow-sm',
      inactive: 'text-lundies-moss hover:bg-lundies-stone/80 hover:text-lundies-charcoal',
    },
    section: 'text-lundies-peat hover:text-lundies-charcoal',
  },
  minimal: {
    primary: {
      active: 'border-peat-600 text-peat-900',
      inactive: 'border-transparent text-peat-500 hover:border-peat-400/70 hover:text-peat-900',
    },
    section: 'border-transparent text-peat-500 hover:border-peat-400/70 hover:text-peat-900',
  },
} as const

function isActiveLink(href: string, pathname: string): boolean {
  if (href === '/') {
    return pathname === '/'
  }
  if (href.startsWith('/#')) {
    return pathname === '/'
  }
  if (href === '/rooms') {
    return pathname.startsWith('/rooms')
  }
  if (href === '/restaurant') {
    return pathname.startsWith('/restaurant')
  }
  if (href === '/booking') {
    return pathname.startsWith('/booking')
  }
  return pathname === href
}

export default function SiteNavigation({
  actionSlot,
  className = '',
  layout = 'landing',
  sectionLinks = [],
}: SiteNavigationProps) {
  const pathname = usePathname()
  const palette = palettes[layout]
  const primaryBase = basePrimaryClasses[layout]
  const sectionBase = baseSectionClasses[layout]

  return (
    <div className={`flex flex-col gap-4 text-lundies-charcoal ${className}`}>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[auto,1fr,auto] md:items-center">
        <Link
          href="/"
          className={
            layout === 'minimal'
              ? 'font-serif text-lg tracking-[0.2em] text-peat-800'
              : 'font-semibold tracking-wide text-lundies-charcoal'
          }
        >
          Schiehallion Hotel
        </Link>

        <div className="order-last -mx-2 overflow-x-auto md:order-none md:justify-self-center">
          <div className="flex min-w-fit items-center gap-3 px-2 md:flex-wrap md:justify-center">
            {primaryLinks.map((link) => {
              const isActive = isActiveLink(link.href, pathname)
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`${primaryBase} ${
                    isActive ? palette.primary.active : palette.primary.inactive
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="order-2 flex items-center justify-end gap-3 md:order-none">
          {actionSlot}
          <Link
            href="/admin"
            className={`${primaryBase} ${palette.primary.inactive} text-xs`}
            title="Admin Panel"
          >
            ⚙️ Admin
          </Link>
          <NavUserProfile />
        </div>
      </div>

      {sectionLinks.length > 0 ? (
        <div className="-mx-2 overflow-x-auto">
          <div className="flex min-w-fit items-center gap-3 px-2 md:flex-wrap md:justify-center">
            {sectionLinks.map((link) => (
              <Link key={link.label} href={link.href} className={`${sectionBase} ${palette.section}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
