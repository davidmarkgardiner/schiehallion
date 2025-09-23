### Epic 2: Authentication & Authorization

_Implement role-based access for guests and staff_

#### User Stories

**SCHH-004** | Extend Auth Context for Hotel Roles  
**As a** system architect  
**I want to** modify AuthContext to support guest/staff/admin roles  
**So that** we can control access to different features  
**Acceptance Criteria:**

- Role enum defined (guest, staff, manager, admin)
- AuthContext extended with role checking
- Permission matrix implemented
- Role assignment on user creation
  **Story Points:** 5

**SCHH-005** | Guest Account Creation Flow  
**As a** guest  
**I want to** create an account or book as a guest  
**So that** I can make reservations quickly  
**Acceptance Criteria:**

- Guest checkout option available
- Account creation during booking
- Email verification optional
- Profile completion encouraged post-booking
  **Story Points:** 8

**SCHH-006** | Staff Login Portal  
**As a** hotel staff member  
**I want to** access the admin dashboard securely  
**So that** I can manage bookings and operations  
**Acceptance Criteria:**

- Separate /admin login route
- Two-factor authentication for staff
- Session management with timeout
- Audit logging of staff actions
  **Story Points:** 5
