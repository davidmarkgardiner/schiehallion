# Homepage Content Update Guide

The redesigned single-page experience is composed of modular data blocks that surface content and imagery for each section. Update content by editing the arrays in `src/app/page.tsx` and replacing assets under `public/images/rooms/`.

## Section map

| Section | Anchor | Data Source | Notes |
| --- | --- | --- | --- |
| Hero | `#overview` | `heroSlides`, `heroStats` | Replace or expand slide entries. First slide uses `priority` loading; keep file sizes optimised. |
| Rooms | `#rooms` | `roomStories` | Each object supports `packages` and `features` arrays for quick updates. Maintain concise `summary` copy (< 25 words). |
| Dining | `#dining` | `diningMoments` | Imagery currently references the rooms image set. Swap with culinary photography when available. |
| Experiences | `#experiences` | `experienceHighlights` | Carousel displays 1–3 cards per viewport. Ensure `imageSrc` paths resolve to optimised assets. |
| Technology | `#technology` | `technologyPillars`, `bookingFlow` | Text emphasises capabilities. Limit descriptions to a single sentence for rhythm. |
| Concierge | `#concierge` | `conciergeFeatures` | Update copy to highlight new AI features. |
| Operations | `#operations` | `operationsHighlights`, `integrationPartners`, `milestones` | Partner badges surface roadmap status—keep labels short for mobile legibility. |
| Recognition | `#awards` | `recognitionBadges` | Add or remove accolades as they are secured. |
| Contact | `#contact` | Hard-coded within section | Keep contact details in sync with operational teams. |

## Imagery guidance

- Use modern formats (WebP/AVIF) sized to the aspect ratios used in each section (hero slides: 16:9, story cards: 4:3).
- Add new files to `public/images/rooms/` (or relevant subdirectories) and reference them via absolute paths (`/images/...`).
- For large hero assets, aim for < 400 KB after optimisation.

## Animation tuning

Scroll reveal timings are controlled by the optional `delay` property passed to `RevealOnScroll`. When adding new cards, stagger delays in 60–100ms increments for subtle sequencing.

## Accessibility checklist

- Provide descriptive `alt` text for every new image.
- Keep headings under 10 words to maintain the minimalist tone.
- Ensure high-contrast colours (minimum 4.5:1) when updating palettes or imagery overlays.
