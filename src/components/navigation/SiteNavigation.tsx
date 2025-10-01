'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import NavUserProfile from '@/components/NavUserProfile'
import { cn } from '@/lib/utils'

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

const palettes = {
  landing: {
    shell: 'border-lundies-stone/40 bg-white/70 shadow-sm backdrop-blur-xl',
    link: 'text-lundies-charcoal/70 hover:text-lundies-charcoal',
    activeLink: 'text-lundies-charcoal',
    indicator: 'bg-lundies-charcoal',
    sectionLink: 'text-lundies-moss/80 hover:text-lundies-charcoal',
  },
  standard: {
    shell: 'border-lundies-stone/60 bg-white/90 shadow-sm backdrop-blur',
    link: 'text-lundies-peat hover:text-lundies-charcoal',
    activeLink: 'text-lundies-charcoal',
    indicator: 'bg-lundies-peat',
    sectionLink: 'text-lundies-peat/80 hover:text-lundies-charcoal',
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
    <nav className={cn('flex flex-col gap-3 text-lundies-charcoal', className)} aria-label="Primary">
      <div
        className={cn(
          'flex flex-col gap-3 rounded-full border px-5 py-4 md:flex-row md:items-center md:justify-between',
          palette.shell
        )}
      >
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.3em] text-lundies-charcoal"
          aria-label="Schiehallion Hotel home"
        >
          Schiehallion Hotel
        </Link>

        <div className="-mx-3 flex items-center gap-1 overflow-x-auto px-3 md:flex-1 md:justify-center">
          {primaryLinks.map((link) => {
            const active = isActiveLink(link.href, pathname)
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'relative whitespace-nowrap px-3 py-1 text-[11px] font-medium uppercase tracking-[0.35em] transition-colors',
                  active ? palette.activeLink : palette.link
                )}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute inset-x-2 -bottom-1 h-[2px] origin-center scale-x-0 rounded-full transition',
                    palette.indicator,
                    active && 'scale-x-100'
                  )}
                />
              </Link>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-2 md:flex-none">
          {actionSlot}
          <Link
            href="/admin"
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] transition-colors',
              palette.link
            )}
            title="Admin Panel"
          >
            ⚙️ Admin
          </Link>
          <NavUserProfile />
        </div>
      </div>

      {sectionLinks.length > 0 ? (
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex min-w-fit items-center justify-center gap-3 py-1">
            {sectionLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'whitespace-nowrap text-[10px] uppercase tracking-[0.4em] transition-colors',
                  palette.sectionLink
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  )
}
