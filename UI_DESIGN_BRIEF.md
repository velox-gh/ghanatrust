# GhanaTrust — UI/UX Design Brief

## 1. Product Overview

### What is GhanaTrust?
GhanaTrust is a **trust-first service marketplace** connecting Ghanaian households and businesses with identity-verified local artisans and professionals. The platform solves a core problem: "Who can I trust to do this job?" by implementing a rigorous 3-level verification system and transparent trust scoring.

### Target Users
- **Customers**: Ghanaian households and businesses needing services (electrical, plumbing, AC repair, carpentry, painting, cleaning, etc.)
- **Service Providers**: Local artisans, technicians, and tradespeople looking to grow their client base
- **Admins**: Platform operators managing verifications, disputes, and user trust standards

### Core Value Proposition
- **Level 1**: Ghana Card ID + Phone verification
- **Level 2**: Trade skill certification verification
- **Level 3**: Verified track record (20+ jobs, 95%+ completion rate, star reviews)

---

## 2. Brand Identity

### Brand Name
**GhanaTrust** — "Building a trusted digital marketplace for Ghana's local service economy."

### Tagline
"Who Can You Trust To Do The Job?"

### Brand Personality
- **Trustworthy**: Professional, reliable, secure
- **Local**: Ghanaian identity, Pan-African pride
- **Modern**: Clean digital experience, not bureaucratic
- **Accessible**: Works for both tech-savvy and first-time smartphone users

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Green** | `#059669` (emerald-600) | Trust, safety, primary actions |
| **Secondary Blue** | `#2563EB` (blue-600) | Customer actions, info |
| **Accent Amber** | `#D97706` (amber-600) | Warnings, pending states, stars |
| **Success Green** | `#10B981` (emerald-500) | Verified, completed |
| **Danger Red** | `#DC2626` (red-600) | Cancel, delete, reject |
| **Dark Background** | `#0F172A` (slate-900) | Hero sections, admin panels |
| **Light Background** | `#F8FAFC` (slate-50) | Page backgrounds |
| **Card White** | `#FFFFFF` | Cards, modals, inputs |

### Typography
- **Headings**: Bold, black weight (`font-black`), tight tracking
- **Body**: Medium weight (`font-medium`), comfortable line height
- **UI Text**: Small caps uppercase for labels (`text-[11px] font-bold uppercase tracking-wider`)
- **Font Stack**: System fonts (Tailwind default)

### Iconography
- Emoji-based for warmth and accessibility (🛡️ 🔧 ⚡ 🚰 ❄️ 🎨 🧹)
- Consistent use across navigation, cards, and status badges

---

## 3. Existing Design System

The app currently uses **Tailwind CSS** with a consistent design language:

### Components
- **Cards**: White background, `rounded-2xl`, subtle border (`border-gray-100`), light shadow
- **Buttons**: Rounded-xl, bold text, shadow effects on primary buttons
- **Inputs**: Slate-50 background, slate-200 border, emerald-500 focus ring
- **Badges**: Rounded-full, border, bold text, color-coded by status
- **Tables**: Clean headers with `bg-gray-50`, hover states on rows

### Layout Patterns
- **Max width**: `max-w-7xl` for content, `max-w-6xl` for dashboards
- **Padding**: `px-4 py-8` standard page padding
- **Grid**: Responsive grids (`grid-cols-1 md:grid-cols-3`)
- **Spacing**: Consistent `gap-6`, `space-y-6` patterns

---

## 4. User Roles & Screens

### Customer Journey
1. **Home Page** (`/`) — Hero search, trust levels explanation, featured providers, category grid
2. **Services** (`/services`) — Browse providers with filters (category, location, verified only)
3. **Provider Profile** (`/providers/:id`) — Provider details, trust badges, reviews, booking form
4. **Booking** (`/booking/:serviceId`) — Select date, describe job, confirm booking
5. **My Bookings** (`/my-bookings`) — Track booking status, cancel, message provider
6. **Booking Detail** (`/my-bookings/:id`) — Status timeline, messaging, payment modal
7. **Payments** (`/payments`) — Transaction history
8. **Dashboard** (`/dashboard`) — Customer stats, quick actions

### Provider Journey
1. **Provider Dashboard** (`/dashboard`) — Trust score, job stats, service management
2. **Verification Forms** — Submit ID, skills certificates for admin review
3. **Job Requests** — Accept/start/complete bookings
4. **Service Management** — Add/remove services offered

### Admin Journey
1. **Admin Dashboard** (`/dashboard`) — 8-tab control panel:
   - **Overview**: Stats cards + recent bookings
   - **Users**: Search, activate/deactivate, role changes, delete
   - **Providers**: Search, verify/unverify all badges
   - **Bookings**: Search, filter by status, admin cancel
   - **Payments**: Filter by status, refund completed
   - **Disputes**: View all with status filters
   - **Verifications**: Approve/reject requests
   - **Audit Logs**: Full action trail with filters

### Public Pages
- **Home** — Marketing + discovery
- **Services** — Provider search/browse
- **Provider Profile** — Public provider page
- **Login** (`/login`) — Simple email/password form
- **Register** (`/register`) — Role toggle, provider profession selection

---

## 5. Key User Flows

### Customer Booking Flow
```
Home → Search "Electrician" → Filter by Location → 
View Provider Card → Click "Book Now" → 
Select Date/Describe Job → Submit Booking → 
Track Status in My Bookings → Pay (mock) → Review
```

### Provider Registration Flow
```
Register → Select "I Provide Service" → 
Enter Personal Info → Select Category → 
Select Main Profession → Create Account → 
Dashboard → Submit Verification → Wait for Admin Approval
```

### Admin Verification Flow
```
Admin Dashboard → Verifications Tab → 
View Pending Requests → Approve/Reject → 
Provider Badge Updated → Audit Log Created
```

---

## 6. Design Requirements

### Responsive Breakpoints
- **Mobile**: 375px+ (primary for customers searching services)
- **Tablet**: 768px+ (dashboard layouts)
- **Desktop**: 1024px+ (admin panels, provider dashboards)

### Accessibility
- High contrast text on all backgrounds
- Focus states on all interactive elements
- Semantic HTML structure
- Screen reader-friendly status badges

### Dark Mode
Not currently implemented, but consider for admin dashboard (reduce eye strain for long sessions).

### Empty States
Every list/table needs thoughtful empty states:
- "No bookings yet — browse services to get started"
- "No verification requests"
- "No disputes found"

### Loading States
- Skeleton loaders for cards and tables
- Spinner for page-level loading
- Button loading states ("...") for actions

### Error States
- Inline error messages for forms
- Alert banners for API failures
- Fallback UI when images/content missing

---

## 7. Reference Inspirations

### Trust & Verification
- **LinkedIn**: Professional badges, verification checkmarks
- **Airbnb**: Trust badges, verified ID, host profiles
- **Upwork**: Skill verification, job history, ratings

### Service Marketplaces
- **Thumbtack**: Service categories, provider cards, booking flow
- **TaskRabbit**: Tasker profiles, trust scores, booking UI
- **Fiverr**: Gig cards, seller levels, review display

### Admin Dashboards
- **Stripe Dashboard**: Clean data tables, filters, action buttons
- **Vercel**: Minimal admin UI, clear status indicators
- **Supabase**: Database-style table views with inline actions

### Local Context (Ghana)
- **Tonaton / Jumia**: Local marketplace patterns
- **Uber**: Location-based service discovery
- **MTN MoMo**: Payment flow familiarity

---

## 8. Technical Constraints

### Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MySQL via Prisma ORM
- **Auth**: JWT tokens in localStorage
- **Real-time**: Socket.io (basic setup)

### Current File Structure
```
client/src/
├── pages/
│   ├── Home.jsx
│   ├── Services.jsx
│   ├── ServiceDetails.jsx
│   ├── ProviderProfile.jsx
│   ├── SearchResults.jsx
│   ├── Booking.jsx
│   ├── MyBookings.jsx
│   ├── BookingDetailPage.jsx
│   ├── Payments.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── NotFound.jsx
├── dashboards/
│   ├── Dashboard.jsx
│   ├── CustomerDashboard.jsx
│   ├── ProviderDashboard.jsx
│   └── AdminDashboard.jsx
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ProviderCard.jsx
│   ├── ServiceCard.jsx
│   └── Rating.jsx
└── context/
    ├── AuthContext.jsx
    ├── SocketContext.jsx
    └── TourContext.jsx
```

### API Base URL
- Development: `http://localhost:5000/api`
- All endpoints prefixed with `/api`

### Design Tokens
Use Tailwind's default scale. Key values:
- Radius: `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-full`
- Shadows: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- Transitions: `transition transform hover:-translate-y-0.5`

---

## 9. Prioritized Improvements Needed

### High Priority
1. **Fix password leak** — `getMe` returns password hash
2. **Prevent self-role assignment** — Registration should ignore client-sent role
3. **Add pagination to admin lists** — Bookings/payments unbounded queries
4. **Fix status timeline** — Add `PRICE_AGREED` and `SCHEDULED` steps

### Medium Priority
5. **Fix booking address** — Either add `address` field or remove from frontend
6. **Fix home search** — Use `locationId` instead of `region` param
7. **Add missing booking filters** — Include `SCHEDULED`, `PRICE_AGREED`, `PAID`
8. **Fix provider service search** — Use case-insensitive `contains`

### Low Priority
9. Remove developer comments from production code
10. Add request timeouts to Axios
11. Add rate limiting to auth endpoints
12. Implement real payment flow
13. Build file upload middleware
14. Create user profile page
15. Add password reset flow

---

## 10. AI Designer Prompt Template

Use this to brief another AI or human designer:

> Design a modern, trust-focused web application called **GhanaTrust** — a service marketplace for Ghana. Users are households and businesses finding verified local artisans (electricians, plumbers, AC technicians, carpenters).
>
> **Key design requirements:**
> - Clean, professional aesthetic with emerald green as primary color
> - Trust badges and verification indicators are central UI elements
> - 3-level verification system (ID → Skills → Track Record)
> - Role-based interfaces: Customer, Provider, Admin
> - Mobile-first responsive design
> - Dark admin dashboard for long work sessions
>
> **Screens to design:**
> 1. Homepage with hero search
> 2. Service browsing with filters
> 3. Provider profile with trust badges
> 4. Booking flow (3 steps)
> 5. My Bookings with status timeline
> 6. Provider dashboard with verification forms
> 7. Admin dashboard with 8 tabs
>
> **Reference:** Stripe Dashboard (admin), Airbnb (trust badges), Thumbtack (service cards)
>
> Tech: React + Tailwind CSS. Output component designs in Tailwind classes.
