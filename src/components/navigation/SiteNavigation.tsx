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
  layout?: 'landing' | 'standard'
  sectionLinks?: NavigationLink[]
  isSticky?: boolean
}

const basePrimaryClasses =
  'whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors'
const baseSectionClasses =
  'whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors'

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
  isSticky = false,
}: SiteNavigationProps) {
  const pathname = usePathname()
  const palette = palettes[layout]
  const stickyClasses = isSticky
    ? 'sticky top-0 z-50 border-b border-white/40 bg-[rgba(245,241,235,0.82)] backdrop-blur-lg'
    : ''

  return (
    <nav
      className={`flex flex-col gap-4 text-lundies-charcoal transition-colors duration-500 ease-out ${stickyClasses} ${className}`}
      aria-label="Primary"
    >
      <div className="flex flex-col gap-4 px-4 py-5 md:grid md:grid-cols-[auto,1fr,auto] md:items-center md:px-10">
        <Link href="/" className="font-semibold tracking-wide text-lundies-charcoal">
          Schiehallion Hotel
        </Link>

        <div className="order-last -mx-2 overflow-x-auto md:order-none md:justify-self-center">
          <div className="flex min-w-fit items-center gap-2 px-2 md:flex-wrap md:justify-center">
            {primaryLinks.map((link) => {
              const isActive = isActiveLink(link.href, pathname)
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`${basePrimaryClasses} ${
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
          {/* Admin Panel Link */}
          <Link
            href="/admin"
            className={`${basePrimaryClasses} ${palette.primary.inactive} text-xs`}
            title="Admin Panel"
          >
            ⚙️ Admin
          </Link>
          <NavUserProfile />
        </div>
      </div>

      {sectionLinks.length > 0 ? (
        <div className="-mx-2 overflow-x-auto border-t border-white/40">
          <div className="flex min-w-fit items-center gap-2 px-6 py-3 md:flex-wrap md:justify-center">
            {sectionLinks.map((link) => (
              <Link key={link.label} href={link.href} className={`${baseSectionClasses} ${palette.section}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  )
}
