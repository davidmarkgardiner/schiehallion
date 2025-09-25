# Restaurant Page Styling Analysis

## Issue Identified
The restaurant page has a **brown/darker background** that is inconsistent with other pages in the application.

## Visual Analysis from Screenshots

### Background Colors Observed:
1. **Home Page**: Clean light beige/ivory background (`bg-lundies-ivory`)
2. **Rooms Page**: Clean light beige/ivory background (`bg-lundies-ivory`)
3. **Restaurant Page**: **Darker brown/tan background** - this is the problem!

### Root Cause Analysis
Looking at the restaurant page code (`/src/app/restaurant/page.tsx` line 651):
```jsx
<main className="min-h-screen bg-lundies-ivory pb-16 pt-10 dark:bg-lundies-charcoal">
```

The issue is that while the main element has the correct `bg-lundies-ivory` class, the overall visual appears darker due to:

1. **Missing proper theme consistency** with other pages
2. **Overlapping background elements** that create a layered brown effect
3. **Dark mode classes** may be interfering in light mode
4. **Gradients or background decorations** not properly aligned with design system

## Comparison with Other Pages

### Home Page Structure (correct):
```jsx
<main className="relative overflow-hidden bg-lundies-ivory text-lundies-charcoal">
```

### Rooms Page Structure (correct):
```jsx
<main className="relative overflow-hidden bg-lundies-ivory text-lundies-charcoal min-h-screen">
```

### Restaurant Page Structure (problematic):
```jsx
<main className="min-h-screen bg-lundies-ivory pb-16 pt-10 dark:bg-lundies-charcoal">
```

## Specific Problems Identified:
1. Missing `relative overflow-hidden` classes
2. Different class order and structure
3. Potential dark mode interference
4. Missing proper background decoration consistency