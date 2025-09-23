# React Key Uniqueness Fix

## Overview

This document addresses the React key uniqueness error in the Schiehallion project, where duplicate keys were causing components to be duplicated or omitted. The error specifically mentions `Encountered two children with the same key, '2026-03-29'`, indicating that calendar components are using date strings as keys without ensuring uniqueness.

## Problem Analysis

### Root Cause

After analyzing the codebase, the primary issue was found in the `AvailabilityCalendar.tsx` component. In the calendar grid rendering, the component uses the array index as the React key:

```tsx
{calendarDays.map((day, index) => {
  // ...
  return (
    <div
      key={index}  // Problem: Using index as key
      className={dayClasses}
      onClick={() => handleDateClick(day.date, day)}
    >
      {/* ... */}
    </div>
  );
})}
```

When using `index` as the key in a list that can change (such as when the calendar navigates between months), React cannot properly track component identities, leading to the warning when components are re-rendered.

Additionally, similar issues were found in the `DragDropCalendar.tsx` component where day headers use simple day names as keys, which could also lead to duplicates.

### Affected Components

1. `src/components/rooms/AvailabilityCalendar.tsx` - Primary location of the issue
2. `src/components/rooms/RoomCard.tsx` - Uses index keys for image indicators
3. `src/components/booking/PackageSelection.tsx` - Uses index keys for menu items
4. `src/components/booking/DragDropCalendar.tsx` - Uses simple values as keys for day headers

## Solution Design

### 1. Fix AvailabilityCalendar Component

Replace the index-based keys with unique identifiers based on the date:

```tsx
{calendarDays.map((day) => {
  // ...
  return (
    <div
      key={day.date.toISOString()}  // Solution: Use unique date string
      className={dayClasses}
      onClick={() => handleDateClick(day.date, day)}
    >
      {/* ... */}
    </div>
  );
})}
```

### 2. Fix RoomCard Component

For the image indicators, use a combination of room ID and index:

```tsx
{room.images && room.images.map((_, index) => (
  <div
    key={`${room.id}-image-${index}`}  // Solution: Use unique combination
    className={`w-2 h-2 rounded-full ${
      index === currentImageIndex ? 'bg-white' : 'bg-white/30'
    }`}
  />
))}
```

### 3. Fix PackageSelection Component

For menu items, use the item content or a unique ID if available:

```tsx
{menuPreviewData[showMenuPreview]?.items.map((item: string, index: number) => (
  <li 
    key={item}  // Solution: Use item content as key (assuming unique)
    className="text-sm text-slate-300 flex items-start gap-2"
  >
    <span className="text-emerald-400 mt-1">•</span>
    {item}
  </li>
))}
```

### 4. Fix DragDropCalendar Component

For day headers, use unique identifiers instead of simple values:

```tsx
{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
  <div key={`header-${day}`} className="text-center text-xs font-medium text-slate-400 py-2">
    {day}
  </div>
))}
```

Additionally, ensure all calendar day elements in DragDropCalendar use unique keys based on date strings rather than indices.

## Implementation Plan

### Step 1: Update AvailabilityCalendar Component

Modify the calendar grid rendering to use date-based keys instead of index-based keys:

1. Locate the calendar grid rendering code in `AvailabilityCalendar.tsx`
2. Replace `key={index}` with `key={day.date.toISOString()}`
3. Verify that the date objects are properly initialized

### Step 2: Update RoomCard Component

Fix the image indicator keys in `RoomCard.tsx`:

1. Locate the image indicator rendering code
2. Replace `key={index}` with `key={`${room.id}-image-${index}`}`
3. Ensure room objects have valid IDs

### Step 3: Update PackageSelection Component

Fix the menu item keys in `PackageSelection.tsx`:

1. Locate the menu item rendering code
2. Replace `key={index}` with `key={item}` or another unique identifier
3. Verify that menu items have unique content

### Step 4: Update DragDropCalendar Component

Fix similar issues in the drag-and-drop calendar component:

1. Locate the day headers rendering code
2. Replace `key={day}` with `key={`header-${day}`}`
3. Verify that all calendar day elements use unique keys based on date strings rather than indices

## Testing Strategy

### Unit Tests

1. Verify that calendar components render without key warnings
2. Test calendar navigation between months
3. Confirm that room image indicators work correctly
4. Validate package selection menu displays properly
5. Check that all list components use unique keys

### Integration Tests

1. Test the complete booking flow with calendar interactions
2. Verify that date selections work correctly across month boundaries
3. Ensure that room selection and image navigation function properly
4. Confirm that drag-and-drop calendar operations work without warnings
5. Validate that all UI components maintain their identity across updates

## Expected Outcomes

1. Elimination of React key uniqueness warnings in the console
2. Improved component identity tracking and rendering performance
3. More stable calendar and UI component behavior
4. Better debugging experience with meaningful keys
5. Consistent UI behavior when navigating between calendar months

## Performance Considerations

1. Using date strings as keys is more stable than indices but slightly less performant
2. The performance impact is negligible for the small number of calendar days (42)
3. String concatenation for composite keys has minimal overhead
4. No additional API calls or data fetching required for the fix

## Backward Compatibility

This change is purely internal to React's reconciliation algorithm and does not affect:
- Component APIs or props
- Data structures or interfaces
- User-facing functionality
- External integrations or APIs