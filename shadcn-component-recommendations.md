# shadcn/ui Component Recommendations for Restaurant Page

## 🎯 Key Components to Integrate

### 1. **Card Component** - High Priority
**Current**: Custom rounded-2xl divs with manual styling
**Recommended**: shadcn/ui Card component
```bash
npx shadcn-ui@latest add card
```
**Benefits**:
- Consistent card styling across the application
- Built-in dark mode support
- Accessibility enhancements

### 2. **Select Component** - High Priority
**Current**: Custom select elements for date/period selection
**Recommended**: shadcn/ui Select component
```bash
npx shadcn-ui@latest add select
```
**Benefits**:
- Better UX with custom dropdown styling
- Keyboard navigation
- Search functionality

### 3. **Button Component** - Medium Priority
**Current**: Custom button styling throughout the page
**Recommended**: shadcn/ui Button component
```bash
npx shadcn-ui@latest add button
```
**Benefits**:
- Consistent button variants (primary, secondary, ghost)
- Built-in loading states
- Focus management

### 4. **Badge Component** - Medium Priority
**Current**: Custom span elements for status badges
**Recommended**: shadcn/ui Badge component
```bash
npx shadcn-ui@latest add badge
```
**Benefits**:
- Consistent badge styling for table status, zones
- Color variants for different states
- Semantic meaning

### 5. **Dialog Component** - Medium Priority
**Current**: Custom modal implementations
**Recommended**: shadcn/ui Dialog component
```bash
npx shadcn-ui@latest add dialog
```
**Benefits**:
- Proper modal accessibility (focus trapping, ESC handling)
- Consistent backdrop and animation
- Better mobile experience

### 6. **Form Components** - Low Priority
**Current**: Basic form elements in reservation forms
**Recommended**: shadcn/ui Form, Input, Label components
```bash
npx shadcn-ui@latest add form input label
```
**Benefits**:
- Better form validation display
- Consistent input styling
- Error state handling

## 🛠️ Implementation Approach

### Phase 1: Core Layout Components
1. Install and configure Card component
2. Replace major card containers with shadcn Card
3. Test responsive behavior and dark mode

### Phase 2: Interactive Elements
1. Replace select dropdowns with shadcn Select
2. Standardize buttons with shadcn Button
3. Update status badges with shadcn Badge

### Phase 3: Advanced UX
1. Implement proper modal dialogs
2. Enhance form components
3. Add loading states and animations

## 📝 Current Component Usage Analysis

### Cards (5 instances):
- Header card
- Date/period selection card
- Floor plan section card
- Reservation summary card
- Time slot management card

### Interactive Elements:
- Date selection dropdown
- Service period buttons
- Table selection interface
- Reservation action buttons
- Time slot selection buttons

### Status Indicators:
- Table availability badges
- Time slot status indicators
- Zone labels
- Accessibility icons

## 🎨 Design System Integration

All shadcn/ui components should be customized to match the Schiehallion theme:
- Use lundies color palette
- Maintain border-radius consistency (rounded-2xl)
- Preserve backdrop-blur effects
- Keep shadow and transparency patterns