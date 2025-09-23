# Schiehallion Hotel Website - Product Requirements Document

## Executive Summary

The Schiehallion Hotel digital transformation project aims to rebuild the existing hotel website using our proven Nano Banana technology stack. This new implementation will deliver a modern, secure, and AI-enhanced booking platform for both room reservations and restaurant table bookings, while maintaining the hotel's traditional Scottish hospitality brand identity.

### Key Objectives

- Modernize the booking experience with drag-and-drop calendar interfaces
- Integrate real-time availability for rooms and restaurant tables
- Implement AI-powered concierge features for guest assistance
- Maintain SEO positioning and local tourism content
- Create an admin dashboard for staff operations

---

## 1. Product Vision & Strategy

### 1.1 Vision Statement

Create Scotland's most intuitive hotel booking experience by combining traditional Highland hospitality with modern AI-assisted technology, enabling guests to seamlessly plan their entire Perthshire experience.

### 1.2 Success Metrics

| Metric                       | Target                       | Measurement Period   |
| ---------------------------- | ---------------------------- | -------------------- |
| Direct booking conversion    | +40% vs current              | 6 months post-launch |
| Mobile booking completion    | 85% success rate             | Monthly              |
| Guest satisfaction (reviews) | Maintain 4.8+ rating         | Ongoing              |
| Staff efficiency             | -50% booking management time | 3 months post-launch |
| AI assistant utilization     | 60% of visitors engage       | Monthly              |

### 1.3 User Personas

**Primary: The Highland Explorer**

- Age 35-55, planning Scottish getaway
- Values authentic experiences and local knowledge
- Books 2-4 weeks in advance
- Needs: Easy booking, local recommendations, package deals

**Secondary: The Business Traveler**

- Frequent Perthshire visitor
- Quick booking requirements
- Needs: Fast checkout, reliable WiFi info, dining availability

**Tertiary: The Event Planner**

- Organizing family gatherings or small events
- Needs: Multiple room booking, dining coordination, group rates

---

## 2. Feature Requirements

### 2.1 Core Booking System

#### Room Booking Engine

- **Visual Calendar Grid**: Drag-and-drop room selection using `react-beautiful-dnd`
- **Real-time Availability**: Firebase Realtime Database syncing
- **Dynamic Pricing**: Package combinations (B&B, Half-board, Room-only)
- **Multi-room Booking**: Shopping cart pattern for group reservations
- **Instant Confirmation**: Automated email/SMS via SendGrid

#### Restaurant Table Booking

- **Interactive Floor Plan**: Visual table selection with `dnd-kit`
- **Time Slot Management**: 2-hour default slots, configurable by service
- **Special Requirements**: Dietary preferences, accessibility needs
- **Waitlist Management**: Automated queue with notification triggers
- **Integration**: Sync with existing POS systems via API

### 2.2 AI-Powered Features

#### Virtual Concierge (Enhanced from Nano Banana)

- **Capabilities**:
  - Local attraction recommendations based on guest preferences
  - Real-time weather-adjusted activity suggestions
  - Distillery tour bookings with partner integration
  - Restaurant menu queries and allergen information
  - Multi-language support (English, Gaelic, German, French)

#### Smart Booking Assistant

- **Predictive Availability**: "Rooms like this are usually available on..."
- **Package Recommendations**: Based on previous guest patterns
- **Upsell Intelligence**: Contextual dinner/activity additions
- **Accessibility Matching**: Room features to guest needs

### 2.3 Content Management

#### Dynamic Content Areas

- **Room Profiles**:
  - 360° virtual tours
  - AI-generated alt text for accessibility
  - Seasonal photo galleries
  - Guest photo submissions with moderation

- **Local Attractions Hub**:
  - Partner business integration
  - Live event feeds from VisitScotland API
  - Weather-dependent suggestions
  - Distance/time calculations from hotel

- **Dining Showcase**:
  - Seasonal menu updates
  - Chef's specials with dietary tags
  - Wine pairing suggestions
  - Sunday roast countdown timer

### 2.4 Admin Dashboard

#### Operations Center

- **Booking Management**:
  - Drag-and-drop room assignments
  - Overbooking management tools
  - Block booking for groups
  - Housekeeping status board

- **Revenue Optimization**:
  - Dynamic pricing rules engine
  - Occupancy forecasting
  - Package performance analytics
  - Competitor rate monitoring

- **Guest Communication**:
  - Pre-arrival email automation
  - Check-in/out notifications
  - Review request scheduling
  - Loyalty program management

### 2.5 Integration Requirements

| System            | Purpose               | Priority |
| ----------------- | --------------------- | -------- |
| Hotels.uk.com API | Channel management    | Critical |
| Booking.com XML   | Rate parity sync      | Critical |
| Stripe/Square     | Payment processing    | Critical |
| SendGrid          | Transactional email   | Critical |
| Twillio           | SMS notifications     | High     |
| VisitScotland API | Event/attraction data | Medium   |
| Weather API       | Activity suggestions  | Medium   |
| Google Business   | Review aggregation    | Medium   |

---

## 3. User Experience Design

### 3.1 Design Principles

- **Highland Hospitality First**: Warm, welcoming interface reflecting Scottish heritage
- **Mobile-Optimized**: 70% of bookings expected via mobile
- **Accessibility**: WCAG 2.1 AA compliance minimum
- **Progressive Enhancement**: Core booking works without JavaScript

### 3.2 User Flows

#### Primary Booking Flow

1. Landing → Room Selection (visual calendar)
2. Package Selection (drag options to cart)
3. Guest Details (with autofill for returning guests)
4. Payment (Stripe Elements, saved cards)
5. Confirmation (email + dashboard access)

#### Restaurant Booking Flow

1. Date/Time Selection → Visual availability
2. Table Selection → Interactive floor plan
3. Guest Details → Dietary preferences
4. Confirmation → Calendar integration

### 3.3 Brand Adaptation

- Maintain Schiehallion tartan patterns in UI accents
- Scottish landscape photography throughout
- Gaelic welcome messages with translations
- Whisky-amber color palette with highland green accents

---

## 4. Technical Architecture

### 4.1 Stack Overview (Nano Banana Foundation)

| Layer            | Technology            | Adaptation for Hotel             |
| ---------------- | --------------------- | -------------------------------- |
| Frontend         | Next.js 15 App Router | + Room/table booking modules     |
| UI Components    | React + TailwindCSS   | + react-beautiful-dnd, dnd-kit   |
| State Management | Context API + Zustand | + Booking cart state             |
| Authentication   | Firebase Auth         | + Guest accounts, staff roles    |
| Database         | Firestore             | + Booking collections, inventory |
| Real-time        | Firebase Realtime DB  | Room/table availability sync     |
| Storage          | Firebase Storage      | Guest photos, virtual tours      |
| AI Services      | Gemini + OpenAI       | Multi-provider concierge         |
| Payments         | Stripe                | Elements + payment intents       |
| Email/SMS        | SendGrid + Twilio     | Transactional + marketing        |
| Analytics        | GA4 + Mixpanel        | Booking funnel optimization      |
| Monitoring       | Sentry + LogRocket    | Error tracking + session replay  |

### 4.2 Data Models

#### Core Collections

```typescript
// Rooms Collection
interface Room {
  id: string;
  name: string;
  type: "double" | "twin" | "family" | "deluxe";
  floor: number;
  features: string[];
  capacity: {
    adults: number;
    children: number;
  };
  basePrice: number;
  images: string[];
  status: "available" | "occupied" | "maintenance";
}

// Bookings Collection
interface Booking {
  id: string;
  userId?: string;
  guestInfo: GuestInfo;
  rooms: BookingRoom[];
  checkIn: Timestamp;
  checkOut: Timestamp;
  status: "pending" | "confirmed" | "checked-in" | "completed" | "cancelled";
  totalAmount: number;
  paymentIntent?: string;
  specialRequests?: string;
  createdAt: Timestamp;
}

// Restaurant Tables Collection
interface Table {
  id: string;
  number: number;
  capacity: number;
  location: "main" | "bar" | "private";
  position: { x: number; y: number };
  features: string[]; // 'window', 'accessible', 'quiet'
}

// Table Reservations Collection
interface TableReservation {
  id: string;
  tableId: string;
  guestInfo: GuestInfo;
  date: Timestamp;
  timeSlot: string; // "18:00-20:00"
  partySize: number;
  specialRequests?: string;
  status: "confirmed" | "arrived" | "completed" | "no-show" | "cancelled";
}
```

### 4.3 Security Rules

```javascript
// Firestore Rules (extending Nano Banana pattern)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for rooms and tables
    match /rooms/{roomId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.token.role == 'staff';
    }

    // Bookings: users see own, staff see all
    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.token.role in ['staff', 'admin']);
      allow create: if true; // Allow guest bookings
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.token.role in ['staff', 'admin']);
    }

    // Availability calendar: public read, staff write
    match /availability/{date} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.token.role in ['staff', 'admin'];
    }
  }
}
```

### 4.4 API Routes Structure

```
src/app/api/
├── bookings/
│   ├── create/route.ts       # New booking creation
│   ├── [id]/route.ts         # Get/update/cancel booking
│   ├── availability/route.ts # Check room availability
│   └── confirm/route.ts      # Payment confirmation
├── restaurant/
│   ├── tables/route.ts       # Table configuration
│   ├── reserve/route.ts      # Create reservation
│   └── availability/route.ts # Table availability
├── ai/
│   ├── concierge/route.ts   # Guest assistance
│   ├── suggest/route.ts     # Personalized recommendations
│   └── translate/route.ts   # Multi-language support
├── admin/
│   ├── dashboard/route.ts   # Analytics data
│   ├── pricing/route.ts     # Dynamic pricing updates
│   └── reports/route.ts     # Operational reports
└── webhooks/
    ├── stripe/route.ts      # Payment webhooks
    └── channel/route.ts     # OTA updates
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

- [ ] Fork Nano Banana repository
- [ ] Adapt authentication for guest/staff roles
- [ ] Create room and booking data models
- [ ] Basic room listing and detail pages
- [ ] Integrate Stripe payment flow

### Phase 2: Booking Engine (Weeks 5-8)

- [ ] Visual calendar component with drag-and-drop
- [ ] Real-time availability checking
- [ ] Multi-room cart functionality
- [ ] Booking confirmation flow
- [ ] Email/SMS notifications

### Phase 3: Restaurant Module (Weeks 9-11)

- [ ] Table management interface
- [ ] Visual floor plan with dnd-kit
- [ ] Reservation system
- [ ] Kitchen notification integration
- [ ] Waitlist management

### Phase 4: AI Enhancement (Weeks 12-14)

- [ ] Adapt Nano Banana chat assistant
- [ ] Train on hotel-specific content
- [ ] Implement booking assistance
- [ ] Add local recommendation engine
- [ ] Multi-language support

### Phase 5: Admin Dashboard (Weeks 15-17)

- [ ] Operations dashboard
- [ ] Revenue management tools
- [ ] Guest communication center
- [ ] Analytics and reporting
- [ ] Staff training materials

### Phase 6: Testing & Launch (Weeks 18-20)

- [ ] Comprehensive testing suite
- [ ] Load testing for peak season
- [ ] Staff training sessions
- [ ] Soft launch with limited availability
- [ ] Full production deployment

---

## 6. Success Criteria & KPIs

### Launch Criteria

- [ ] 100% feature parity with current site
- [ ] <2 second page load time
- [ ] 99.9% uptime SLA achieved in staging
- [ ] All payment flows PCI compliant
- [ ] Staff trained and confident

### Post-Launch Monitoring

- Booking conversion rate
- Average booking value
- Mobile completion rate
- AI assistant engagement
- Guest satisfaction scores
- Staff efficiency metrics
- System performance metrics

---

## 7. Risk Mitigation

| Risk                        | Mitigation Strategy                               |
| --------------------------- | ------------------------------------------------- |
| Payment processing failures | Fallback to manual processing, multiple providers |
| Overbooking scenarios       | Automatic partner hotel overflow, upgrade logic   |
| AI hallucinations           | Strict grounding in hotel data, human fallback    |
| Peak season load            | Auto-scaling, CDN, queue management               |
| Data migration issues       | Parallel running period, rollback plan            |

---

## 8. Budget & Resources

### Development Team

- 1 Lead Developer (Next.js/Firebase specialist)
- 1 Frontend Developer (React/UI focus)
- 1 Backend Developer (Firebase/integrations)
- 1 UX Designer (part-time)
- 1 Project Manager

### Timeline

- Total Duration: 20 weeks
- Development: 17 weeks
- Testing/Launch: 3 weeks

### Infrastructure Costs (Monthly)

- Firebase: ~£500 (including Firestore, Auth, Storage, Functions)
- Vercel: £150 (Pro plan)
- Stripe: 2.4% + 20p per transaction
- SendGrid: £75 (Pro plan)
- AI APIs: ~£200 (usage-based)
- **Total: ~£925/month + transaction fees**

---

## 9. Maintenance & Evolution

### Ongoing Requirements

- Weekly content updates (menus, events)
- Monthly analytics review
- Quarterly feature releases
- Annual security audit
- Continuous AI training

### Future Enhancements (Year 2)

- Mobile app development
- IoT room controls integration
- Loyalty program expansion
- Dynamic packaging with partners
- Voice booking assistant

---

## 10. Appendices

### A. Nano Banana Module Mapping

| Nano Banana Module | Hotel Adaptation              |
| ------------------ | ----------------------------- |
| AuthContext        | + Guest accounts, staff roles |
| ImageGenerator     | → RoomGallery component       |
| CanvasImageContext | → BookingCartContext          |
| AdminApprovals     | → StaffDashboard              |
| ChatBotWidget      | → ConciergeChatWidget         |
| FirestoreDemo      | → ReviewsSection              |

### B. Integration Specifications

- [Hotels.uk.com API Documentation]
- [Stripe Payment Intents Guide]
- [SendGrid Transactional Templates]
- [VisitScotland Event Feed API]

### C. Compliance Requirements

- GDPR compliance for guest data
- PCI DSS for payment processing
- Scottish Tourism Board standards
- Accessibility standards (WCAG 2.1 AA)

---

_This PRD represents the complete specification for the Schiehallion Hotel website rebuild, leveraging our proven Nano Banana architecture while adding hospitality-specific features. The modular approach ensures we can reuse core components while customizing for the hotel industry's unique requirements._
