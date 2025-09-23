### Epic 2: Authentication & Authorization

_Implement role-based access for guests and staff_

#### Overview
- **Problem / Opportunity:** The current authentication flow does not differentiate between guests, hotel staff, or managers. Without role awareness the application cannot protect privileged features, creating security and compliance risk.
- **Goals:**
  - Introduce a robust role model that covers guest, staff, manager, and admin behaviours.
  - Ensure every critical route, component, and API surface enforces the correct permissions.
  - Provide a streamlined but secure account experience for both external guests and internal staff.
- **Success Metrics:**
  - 100% of privileged dashboard routes and booking-management actions require an authenticated role.
  - Staff authentication sessions expire after the configured inactivity window and are logged.
  - Guest self-service funnel completion rate is unaffected (≤ 2% drop) after introducing authentication changes.
- **Out of Scope:** Loyalty programme, payment provider SSO, and any back-office integrations.
- **Dependencies & Assumptions:**
  - Firebase Authentication continues to be the identity provider.
  - The notification service is available for optional email verification and MFA codes.
  - UX copy for new flows will be delivered by Product prior to development.

#### User Stories

**SCHH-004** | Extend Auth Context for Hotel Roles  
**As a** system architect  
**I want to** modify AuthContext to support guest/staff/manager/admin roles  
**So that** we can control access to different features  
**Acceptance Criteria:**
1. Role enum defined centrally and shared between client and server code paths (guest, staff, manager, admin).
2. AuthContext exposes `currentUser`, `role`, and `hasPermission(feature)` helpers consumed by protected UI components.
3. A permission matrix (covering booking view/edit, dashboard, staff tools, and admin settings) is implemented and unit-tested.
4. Role assignment occurs on user creation and is persisted in Firestore, with migration guidance for existing users.
5. Unauthorised access attempts redirect to a "Not permitted" view and emit an audit log entry.
  **Story Points:** 5  
  **Tech Notes:** Create a higher-order component (HOC) or hook to wrap protected pages and centralise role checks.

**SCHH-005** | Guest Account Creation Flow  
**As a** guest  
**I want to** create an account or book as a guest  
**So that** I can make reservations quickly  
**Acceptance Criteria:**
1. Checkout presents "Continue as guest" and "Create account" options with clear copy describing benefits.
2. Account creation captures minimal required fields (name, email, stay details) and optionally triggers email verification using the notification service.
3. Successful guest checkout stores reservation and creates a guest profile record linked to the authenticated identity when available.
4. Post-booking screen nudges guests to complete their profile (loyalty enrolment is still out of scope).
5. Analytics event logged for each step to monitor drop-off.
  **Story Points:** 8  
  **Tech Notes:** Reuse existing booking components; add integration tests covering guest checkout path.

**SCHH-006** | Staff Login Portal  
**As a** hotel staff member  
**I want to** access the admin dashboard securely  
**So that** I can manage bookings and operations  
**Acceptance Criteria:**
1. Introduce dedicated `/admin` route with branded staff login form and role-specific messaging.
2. Two-factor authentication (email or SMS OTP) enforced for staff, managers, and admins; flows handle resend and failure cases.
3. Sessions expire after 15 minutes of inactivity, forcing re-authentication and logging the event.
4. Audit logging captures login success/failure, privileged page access, and critical actions (edit booking, issue refund).
5. Accessibility review confirms the login portal meets WCAG AA for keyboard navigation and screen readers.
  **Story Points:** 5  
  **Tech Notes:** Coordinate with DevOps for secure storage of OTP secrets; add automated smoke tests validating protected routes.

#### Risks & Mitigations
- **Complexity of permission matrix:** Mitigate by documenting matrix in code comments and tests; schedule peer review early.
- **MFA delivery failures:** Provide manual code entry fallback and monitor notification service health dashboards.
- **Regression in guest conversion:** Use feature flag to roll out guest flow changes gradually and monitor analytics.

#### Open Questions
- Do managers require elevated Firestore permissions beyond staff, or can UI gating suffice?
- Should admins be able to invite staff via email, or is creation handled manually by IT?
- Are there regulatory requirements (e.g., PCI, GDPR) demanding additional logging retention policies?
