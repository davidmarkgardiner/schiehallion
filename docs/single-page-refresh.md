# Schiehallion Single-Page Experience Guide

This guide documents how to maintain the redesigned single-page website so the visual language stays consistent with the luxury, minimalist direction inspired by Lundies.

## Section Overview

The landing page (`src/app/page.tsx`) is organised into modular, full-width sections that align with the navigation anchors:

1. **Hero** – Full viewport imagery with rotating slides, primary CTA, and scroll indicator.
2. **Rooms & Suites** – Alternating image/text layouts detailing the four core room personas.
3. **Dining** – Three culinary highlights plus an operational callout banner.
4. **Experiences** – Carousel imagery, partner highlights, and concierge integration notes.
5. **Technology** – Platform pillars and the four-stage booking flow.
6. **Operations** – Operations, revenue, and guest relationship modules.
7. **Awards** – Credentials presented as centred badges.
8. **Contact** – Address, phone, email, and brand promise badges.

Each section has a dedicated `id` used by the sticky navigation for smooth scrolling.

## Updating Imagery

- Hero slides are defined in the `heroSlides` array. Provide WebP images (`1920 × 1280` recommended) placed under `public/images/hero/` or an equivalent folder.
- Room, dining, and experience images are referenced directly in `stayCollections`, `diningJourneys`, and `experienceGallery`.
- When adding new assets, include descriptive `alt` text and keep aspect ratios consistent (4:3 or 3:2) to preserve the layout rhythm.
- For best performance, export images as WebP with JPEG fallbacks if required. Compress to stay under 400 KB where possible.

## Animation & Accessibility

- Scroll reveal animations are handled by the local `Reveal` component. It automatically respects `prefers-reduced-motion`.
- Hero and experience carousels auto-advance but pause when users prefer reduced motion. Buttons for hero slides allow manual selection.
- Smooth scrolling is enabled globally; ensure new anchor sections have sufficient top padding to avoid being hidden beneath the sticky navigation.

## Content Edits

- Key copy blocks live in the arrays at the top of `page.tsx`. Keep headlines under 10 words and body text concise.
- To add or reorder sections, duplicate an existing pattern and update the `sectionLinks` array so navigation remains accurate.
- Use Tailwind utility classes for spacing and colour. Primary text colour is `text-peat-900`; supporting copy uses `text-peat-600`.

## Performance Tips

- Favour static imports for imagery; Next.js automatically lazy loads images outside the viewport.
- Limit additional JavaScript libraries in this page to preserve bundle size. Reuse existing UI primitives (Carousel, buttons) when adding interactivity.
- Run `npm run lint` and `npm run build` before deploying to verify accessibility and performance budgets.

Maintaining these practices will keep the Schiehallion experience cohesive, fast, and aligned with the minimalist luxury aesthetic.
