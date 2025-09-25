# Restaurant Page Styling Fix - Todo List

## Phase 1: Background Consistency Fix
- [ ] Update main element classes to match home/rooms page structure
- [ ] Add proper `relative overflow-hidden` classes
- [ ] Ensure consistent `bg-lundies-ivory` application
- [ ] Fix class order to match other pages

## Phase 2: Background Decoration Alignment
- [ ] Add consistent background decoration elements (blur circles)
- [ ] Ensure proper z-index layering with `-z-10`
- [ ] Match the decorative elements from home/rooms pages

## Phase 3: Dark Mode Consistency
- [ ] Review dark mode classes for proper application
- [ ] Ensure dark mode doesn't interfere with light mode display
- [ ] Test both light and dark mode backgrounds

## Phase 4: Component Background Consistency
- [ ] Review card/section backgrounds for consistency
- [ ] Ensure white/transparent backgrounds match design system
- [ ] Check text color consistency across components

## Phase 5: shadcn/ui Component Integration
- [ ] Identify which shadcn/ui components should be used
- [ ] Replace custom styled elements with shadcn/ui equivalents
- [ ] Ensure proper theme integration

## Phase 6: Testing & Validation
- [ ] Use Playwright to capture before/after screenshots
- [ ] Test responsive behavior across devices
- [ ] Validate accessibility compliance
- [ ] Check color contrast ratios

## Implementation Priority:
1. **Critical**: Fix main background consistency (Phase 1 & 2)
2. **High**: Dark mode fixes (Phase 3)
3. **Medium**: Component consistency (Phase 4)
4. **Low**: shadcn/ui integration (Phase 5)

## Expected Outcome:
Restaurant page should have the same light, clean ivory background as home and rooms pages, with proper decorative elements and consistent theming.