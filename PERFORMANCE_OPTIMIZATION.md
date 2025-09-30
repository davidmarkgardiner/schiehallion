# Performance Optimization Guide

## Current Status

### Bundle Size Issues
- **Initial Load**: 4.6MB JavaScript (Development mode)
- **Target**: < 500KB (Production mode)
- **Status**: In Progress

### Firestore Listener Strategy
The application currently uses real-time listeners (`onSnapshot`, `onValue`) which prevent pages from reaching "networkidle" state. This is causing 30-120 second timeouts on authenticated pages.

## Optimizations Implemented

### 1. Next.js Configuration (`next.config.js`)
- Added Firebase packages to `optimizePackageImports`
- Configured webpack aliases to prevent compat SDK usage
- Enabled production console removal

### 2. Code Splitting (`src/lib/firebase-lazy.ts`)
Created lazy-loading utilities for Firebase modules:
- `lazyFirestore()` - Basic Firestore read operations
- `lazyFirestoreWrite()` - Admin write operations
- `lazyRealtimeDB()` - Real-time database (only when needed)
- `lazyAdminServices()` - Heavy booking/room services
- `lazyRestaurantService()` - Restaurant-specific features

### 3. Component Lazy Loading
- Chatbot widget: Lazy loaded in root layout
- Rooms page: Dynamic imports for RoomList, Calendar, Cart, PerformanceDashboard
- Restaurant pages: Should lazy load service on mount

## Real-time Listener Audit

### Current Usage
1. **AvailabilityService.subscribeToAvailability()** (`src/lib/firebase/hotel-service.ts:558`)
   - Uses RTDB `onValue` to watch availability changes
   - **Used by**: Availability calendar component
   - **Recommendation**: Only subscribe when calendar is visible, unsubscribe on unmount

2. **RestaurantService.subscribeToRealtimeAvailability()** (`src/services/restaurantService.ts:212`)
   - Uses RTDB `onValue` for live table availability
   - **Used by**: Restaurant booking components
   - **Recommendation**: Only subscribe when user is actively viewing booking interface

3. **RestaurantService.subscribeToTableUpdates()** (`src/services/restaurantService.ts:613`)
   - Uses Firestore `onSnapshot` for admin table management
   - **Used by**: Admin restaurant management pages
   - **Recommendation**: Convert to polling with getDocs() every 30 seconds, or only subscribe when tab is active

## Optimization Strategy

### Phase 1: Immediate (Completed)
- ✅ Configure Next.js for Firebase optimization
- ✅ Create lazy-loading utilities
- ✅ Implement dynamic imports for heavy components

### Phase 2: Listener Optimization (To Do)
- [ ] Update AvailabilityCalendar to use lazy subscription
- [ ] Add cleanup/unsubscribe logic to all components with listeners
- [ ] Convert admin table management to polling (getDocs every 30s)
- [ ] Add visibility API detection to pause listeners when tab is hidden

### Phase 3: Production Build (To Do)
- [ ] Build production bundle (`pnpm run build`)
- [ ] Measure actual bundle sizes
- [ ] Run Lighthouse performance audit
- [ ] Verify Core Web Vitals improvements

### Phase 4: Advanced Optimizations (Future)
- [ ] Implement service workers for offline caching
- [ ] Add bundle analyzer to monitor size over time
- [ ] Consider SSR/SSG for initial data instead of client-side queries
- [ ] Implement pagination for large Firestore collections
- [ ] Add WebP images and lazy loading

## How to Verify Improvements

### Development Mode (Current)
```bash
pnpm run dev
# Navigate to http://localhost:3000
# Open DevTools > Network tab
# Check "Disable cache"
# Hard refresh (Cmd+Shift+R)
# Measure total JS transfer size
```

### Production Mode (After Build)
```bash
pnpm run build
pnpm start
# Repeat measurement steps above
# Expected: 80-90% reduction in bundle size
```

### Performance Testing
```bash
# Run the chrome agent performance test
/chrome test performance improvements
```

## Best Practices Going Forward

### For New Components
1. **Use lazy imports** for non-critical features:
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     ssr: false,
     loading: () => <Spinner />
   })
   ```

2. **Avoid real-time listeners** unless truly necessary:
   ```typescript
   // BAD: Always listening
   useEffect(() => {
     const unsubscribe = onSnapshot(docRef, callback)
     return () => unsubscribe()
   }, [])

   // GOOD: Fetch once and refresh on user action
   useEffect(() => {
     getDocs(query).then(callback)
   }, [])
   ```

3. **Use lazy Firebase imports**:
   ```typescript
   // Instead of:
   import { collection, getDocs } from 'firebase/firestore'

   // Use:
   import { lazyFirestore } from '@/lib/firebase-lazy'
   const { collection, getDocs } = await lazyFirestore()
   ```

### For Admin Routes
- All admin pages should use dynamic imports
- Heavy operations should use `lazyAdminServices()`
- Consider route-level code splitting in `app/admin/layout.tsx`

### For Guest Routes
- Minimize Firebase imports on initial load
- Use SSR/SSG where possible for static content
- Defer non-critical features (chatbot, analytics) to after page load

## Performance Budget

| Metric | Current (Dev) | Target (Prod) | Status |
|--------|---------------|---------------|--------|
| Total JS | 4.6MB | < 500KB | 🔴 |
| First Contentful Paint | 664ms | < 1s | ✅ |
| Time to Interactive | > 30s | < 3s | 🔴 |
| Lighthouse Score | Unknown | > 90 | ⚠️ |

## Next Steps

1. **Complete listener optimization** (Phase 2)
2. **Build production bundle** to verify improvements
3. **Re-run performance tests** with chrome agent
4. **Deploy to staging** for real-world testing
5. **Monitor in production** with Core Web Vitals

## Contact

For questions about these optimizations, see:
- Bundle analysis: Check `next.config.js` webpack config
- Lazy loading: See `src/lib/firebase-lazy.ts`
- Performance testing: Run `/chrome test performance`
