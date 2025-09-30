# Black Page Investigation Report
**Date:** 2025-09-30
**Website:** https://schiehallion.vercel.app/
**Issue Reported:** Black page display

## Executive Summary

**FINDING: The website is NOT showing a black page.** The site is rendering correctly with proper styling and functionality. All tests show the page displays with the expected beige/tan (lundies-ivory/linen/stone) gradient background and the login form is fully functional.

## Investigation Details

### 1. Website Status Check
- **HTTP Status:** 200 OK
- **Server:** Vercel
- **Cache Status:** HIT (cached successfully)
- **Content Type:** text/html; charset=utf-8
- **Page Load:** Successful with no network errors

### 2. CSS Loading Verification
- **CSS Files Loaded:** 2 files (both status 200 OK)
  - `/_next/static/css/7e7d96b1e6991756.css` (fonts)
  - `/_next/static/css/dca645f0824fdbb9.css` (Tailwind styles)
- **Failed Resources:** 0
- **CSS Link Elements:** 2 (both loaded successfully)

### 3. Tailwind Color Classes Verification
Confirmed all lundies theme colors are present in the compiled CSS:
- `.bg-lundies-ivory` - rgb(245 241 235)
- `.bg-lundies-linen` - rgb(235 227 215)
- `.bg-lundies-stone` - rgb(214 206 195)
- `.from-lundies-ivory` - gradient start
- `.via-lundies-linen` - gradient middle
- `.to-lundies-stone` - gradient end

All gradient classes for the main background are properly compiled and accessible.

### 4. JavaScript Errors
- **Console Messages:** 0
- **Page Errors:** 0
- **Runtime Errors:** None detected

### 5. Visual Verification
Screenshots taken at different viewports confirm:
- **Desktop (1920x1080):** ✅ Proper beige gradient background, login form visible
- **Mobile (375x667):** ✅ Proper beige gradient background, responsive layout working

## Page Content Analysis

The page is correctly showing:
1. **Header:** "Schiehallion Hotel" with subtitle "Highland hospitality reimagined"
2. **Login Form:**
   - Email field
   - Password field
   - Login button (blue)
   - Google Sign-in option
   - Sign up link
   - Staff Portal link
3. **Concierge Widget:** "Ask the concierge" button (bottom right)
4. **Background:** Proper lundies theme gradient (ivory → linen → stone)

## Computed Styles Analysis

### Body Element:
- Background: `rgba(0, 0, 0, 0)` (transparent, as expected - relies on child elements)
- Color: `rgb(26, 23, 20)` (lundies-charcoal)
- Min Height: 1080px (full viewport)
- Font Family: Inter, "Inter Fallback"

### Main Element:
- Class: `flex min-h-screen items-center justify-center bg-gradient-to-br from-lundies-ivory via-lundies-linen to-lundies-stone p-4`
- The gradient IS being applied via CSS classes

## Root Cause Analysis

The website is functioning correctly. Possible reasons for user reporting "black page":

### 1. Browser Cache Issue (Most Likely)
- User may be viewing an old cached version
- **Solution:** Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### 2. Browser Dark Mode/Extensions
- Browser extensions or forced dark mode could be overriding styles
- **Solution:** Test in incognito/private mode

### 3. Slow Network Connection
- User may have seen the page during initial load before CSS applied
- **Solution:** Wait for full page load

### 4. Browser Compatibility
- Very old browsers might not support CSS custom properties or gradients
- **Solution:** Test in modern browser (Chrome, Firefox, Safari, Edge)

### 5. Ad Blocker/Content Blocker
- Some aggressive blockers might interfere with CSS loading
- **Solution:** Temporarily disable blockers

## Recommendations

1. **Ask user to:**
   - Clear browser cache and hard refresh (Cmd/Ctrl + Shift + R)
   - Try incognito/private browsing mode
   - Test in a different browser
   - Disable browser extensions temporarily
   - Check if they have a forced dark mode enabled

2. **Add loading state improvement:**
   - Consider adding a visible loading spinner with inline styles
   - Add critical CSS inline in the HTML head for instant background color

3. **Add monitoring:**
   - Consider adding error tracking (Sentry, LogRocket)
   - Add performance monitoring for CSS load times

## Technical Details

### Environment Variables Check
All required Firebase environment variables are present:
- NEXT_PUBLIC_FIREBASE_API_KEY ✅
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ✅
- NEXT_PUBLIC_FIREBASE_PROJECT_ID ✅
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ✅
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ✅
- NEXT_PUBLIC_FIREBASE_APP_ID ✅

### Recent Git Changes
Last commit: `fix: make husky prepare script optional for deployment`
No recent changes to styling or layout that would cause a black page.

## Conclusion

**The website is working correctly and is not showing a black page.** All styling, functionality, and content are rendering as expected. The issue is likely user-specific and related to browser cache, extensions, or viewing the page during a slow load.

## Test Evidence

Evidence files generated during investigation:
- `/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-homepage.png` - Desktop view
- `/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-mobile.png` - Mobile view
- `/Users/davidgardiner/Desktop/repo/schiehallion/website-test-report.json` - Detailed test data

## Next Steps

1. Request specific details from user:
   - Browser and version
   - Operating system
   - Screenshot of what they see
   - Browser console errors (F12 → Console tab)

2. If issue persists, investigate:
   - Geographic location (CDN issues)
   - ISP-level filtering/proxies
   - Corporate network restrictions
