import { useEffect } from 'react'

export function useRevealOnScroll(prefersReducedMotion: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]')

    if (!revealElements.length) return

    if (prefersReducedMotion) {
      revealElements.forEach((element) => {
        element.classList.add('reveal-visible')
      })
      return
    }

    revealElements.forEach((element) => {
      element.classList.add('reveal-element')
    })

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )

    revealElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [prefersReducedMotion])
}
