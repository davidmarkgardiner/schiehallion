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
}

const basePrimaryClasses =
  'whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors'
const baseSectionClasses =
  'whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors'

const palettes = {
  landing: {
    primary: {
      active: 'bg-white/20 text-slate-950 shadow-sm',
      inactive: 'text-slate-300 hover:bg-white/10 hover:text-slate-950',
    },
    section: 'text-slate-400 hover:text-slate-950',
  },
  standard: {
    primary: {
      active: 'bg-slate-800 text-slate-950 shadow-sm',
      inactive: 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-950',
    },
    section: 'text-slate-400 hover:text-slate-200',
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

  return (
    <div className={`flex flex-col gap-4 text-slate-200 ${className}`}>
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[auto,1fr,auto] md:items-center">
        <Link href="/" className="font-semibold tracking-wide text-slate-950">
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
          <NavUserProfile />
        </div>
      </div>

      {sectionLinks.length > 0 ? (
        <div className="-mx-2 overflow-x-auto">
          <div className="flex min-w-fit items-center gap-2 px-2 md:flex-wrap md:justify-center">
            {sectionLinks.map((link) => (
              <Link key={link.label} href={link.href} className={`${baseSectionClasses} ${palette.section}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
