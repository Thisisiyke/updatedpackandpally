# 🗺️ Pack & Pally — Project Map

Quick navigation index for the entire app. Click any link to open it in your browser (make sure dev server is running: `npm run dev`).

> **Start dev server:**
> ```bash
> cd "/Users/iykeiyke/Desktop/vs pac and pally"
> export PATH="$HOME/.local/bin:$PATH"
> npm run dev
> ```

---

## 🌐 Web App

### Marketing & Public Pages

| Screen | URL | Source |
|---|---|---|
| Landing | <http://localhost:3000/> | `src/app/page.tsx` |
| Flights | <http://localhost:3000/flights> | `src/app/flights/page.tsx` |
| Hotels | <http://localhost:3000/hotels> | `src/app/hotels/page.tsx` |
| Browse Group Trips | <http://localhost:3000/browse-trips> | `src/app/browse-trips/page.tsx` |
| AI Features | <http://localhost:3000/ai-features> | `src/app/ai-features/page.tsx` |
| Become a Host | <http://localhost:3000/become-a-host> | `src/app/become-a-host/page.tsx` |

### Authentication

| Screen | URL | Source |
|---|---|---|
| Login | <http://localhost:3000/login> | `src/app/login/page.tsx` |
| Sign Up | <http://localhost:3000/signup> | `src/app/signup/page.tsx` |

### Detail & Booking

| Screen | URL | Source |
|---|---|---|
| Trip Detail (sample) | <http://localhost:3000/trips/trip-1> | `src/app/trips/[id]/page.tsx` |
| Flight Select (sample) | [Flight detail](http://localhost:3000/flights/select?origin=New%20York&destination=Paris&departDate=2026-05-15&returnDate=2026-05-22&passengers=1&cabin=economy&tripType=roundtrip) | `src/app/flights/select/page.tsx` |
| Hotel Detail (requires search first) | <http://localhost:3000/hotels> | `src/app/hotels/[id]/page.tsx` |
| Checkout | <http://localhost:3000/checkout> | `src/app/checkout/page.tsx` |
| Confirmation | `http://localhost:3000/bookings/{bookingId}/confirmed` | `src/app/bookings/[id]/confirmed/page.tsx` |

### User Dashboard

| Screen | URL | Source |
|---|---|---|
| Dashboard (Overview, Bookings, Profile, Settings) | <http://localhost:3000/dashboard> | `src/app/dashboard/page.tsx` |

### 🏢 Partner Portal (Web only)

| Screen | URL | Source |
|---|---|---|
| Overview | <http://localhost:3000/partner> | `src/app/partner/page.tsx` |
| Listings | <http://localhost:3000/partner/listings> | `src/app/partner/listings/page.tsx` |
| New Listing | <http://localhost:3000/partner/listings/new> | `src/app/partner/listings/new/page.tsx` |
| Edit Listing (sample) | <http://localhost:3000/partner/listings/listing-1> | `src/app/partner/listings/[id]/page.tsx` |
| Group Trips | <http://localhost:3000/partner/trips> | `src/app/partner/trips/page.tsx` |
| New Trip | <http://localhost:3000/partner/trips/new> | `src/app/partner/trips/new/page.tsx` |
| Edit Trip (sample) | <http://localhost:3000/partner/trips/ptrip-1> | `src/app/partner/trips/[id]/page.tsx` |
| Calendar | <http://localhost:3000/partner/calendar> | `src/app/partner/calendar/page.tsx` |
| Bookings | <http://localhost:3000/partner/bookings> | `src/app/partner/bookings/page.tsx` |
| Payouts | <http://localhost:3000/partner/payouts> | `src/app/partner/payouts/page.tsx` |

### 🛡️ Admin Panel (Web only)

| Screen | URL | Source |
|---|---|---|
| Overview | <http://localhost:3000/admin> | `src/app/admin/page.tsx` |
| Users | <http://localhost:3000/admin/users> | `src/app/admin/users/page.tsx` |
| Partners | <http://localhost:3000/admin/partners> | `src/app/admin/partners/page.tsx` |
| Bookings | <http://localhost:3000/admin/bookings> | `src/app/admin/bookings/page.tsx` |
| Disputes | <http://localhost:3000/admin/disputes> | `src/app/admin/disputes/page.tsx` |

---

## 📱 Mobile App

View all mobile screens in a phone frame on desktop, or resize to mobile width for fullscreen.

### Flow: Onboarding → Auth → App

| # | Screen | URL | Source |
|---|---|---|---|
| 1 | Splash (auto-advances) | <http://localhost:3000/mobile> | `src/app/mobile/page.tsx` |
| 2 | Onboarding (3 slides) | <http://localhost:3000/mobile/onboarding> | `src/app/mobile/onboarding/page.tsx` |
| 3 | Login / Sign Up | <http://localhost:3000/mobile/auth> | `src/app/mobile/auth/page.tsx` |

### Main Tabs (after auth)

| Screen | URL | Source |
|---|---|---|
| 🏠 Home | <http://localhost:3000/mobile/home> | `src/app/mobile/home/page.tsx` |
| 🧭 Explore | <http://localhost:3000/mobile/explore> | `src/app/mobile/explore/page.tsx` |
| ❤️ Bookings (My Trips) | <http://localhost:3000/mobile/bookings> | `src/app/mobile/bookings/page.tsx` |
| 👤 Profile | <http://localhost:3000/mobile/profile> | `src/app/mobile/profile/page.tsx` |

### Search Results

| Screen | URL | Source |
|---|---|---|
| Flight Search | [Flight results](http://localhost:3000/mobile/search/flights?origin=New%20York&destination=Paris&departDate=2026-05-15&returnDate=2026-05-22&passengers=1&cabin=economy) | `src/app/mobile/search/flights/page.tsx` |
| Hotel Search | [Hotel results](http://localhost:3000/mobile/search/hotels?location=Paris%2C%20France&checkIn=2026-05-15&checkOut=2026-05-20&guests=2&rooms=1) | `src/app/mobile/search/hotels/page.tsx` |
| Group Trips | <http://localhost:3000/mobile/search/trips> | `src/app/mobile/search/trips/page.tsx` |

### Detail Pages

| Screen | URL | Source |
|---|---|---|
| Trip Detail (sample) | <http://localhost:3000/mobile/trips/trip-1> | `src/app/mobile/trips/[id]/page.tsx` |
| Flight Detail | Navigate via `/mobile/search/flights` | `src/app/mobile/flights/[id]/page.tsx` |
| Hotel Detail | Navigate via `/mobile/search/hotels` | `src/app/mobile/hotels/[id]/page.tsx` |

### Booking

| Screen | URL | Source |
|---|---|---|
| Checkout (3-step) | <http://localhost:3000/mobile/checkout> | `src/app/mobile/checkout/page.tsx` |
| Confirmation | `http://localhost:3000/mobile/confirmation/{bookingId}` | `src/app/mobile/confirmation/[id]/page.tsx` |

---

## 🏗️ Project Structure

```
vs pac and pally/
├── src/
│   ├── app/
│   │   ├── (root web pages)       ← Web app routes
│   │   ├── partner/               ← Partner portal (web only)
│   │   ├── admin/                 ← Admin panel (web only)
│   │   └── mobile/                ← Mobile app (all routes)
│   ├── components/
│   │   ├── layout/                ← Web navbar, footer
│   │   ├── mobile/                ← Phone frame, bottom tabs, mobile header
│   │   ├── partner/               ← Partner sidebar
│   │   ├── admin/                 ← Admin sidebar
│   │   ├── landing/, trips/,
│   │   │   flights/, hotels/,
│   │   │   checkout/, ai/         ← Feature components
│   │   └── ui/                    ← Shared shadcn components
│   ├── data/                      ← Mock data (shared web + mobile)
│   │   ├── trips.ts
│   │   ├── hosts.ts
│   │   ├── partner-listings.ts
│   │   ├── partner-trips.ts
│   │   ├── admin.ts
│   │   └── ...
│   ├── lib/                       ← Utilities & generators
│   │   ├── flight-generator.ts
│   │   ├── hotel-generator.ts
│   │   └── ...
│   └── types/                     ← TypeScript types
├── prisma/                        ← Database schema (SQLite)
└── public/                        ← Static assets (logo, images)
```

### Key separation points

- **Mobile routes** live exclusively under `src/app/mobile/*`
- **Partner & Admin routes** are web-only (`src/app/partner/*` and `src/app/admin/*`)
- **Shared logic** (mock data, type definitions, generators) lives in `src/data/`, `src/lib/`, `src/types/` — reused by both web and mobile
- **`RouteShell` component** (`src/components/layout/route-shell.tsx`) auto-hides the main navbar/footer on `/mobile/*` routes

---

## ⚡ Quick Start Commands

```bash
# Navigate to project
cd "/Users/iykeiyke/Desktop/vs pac and pally"

# Make Node accessible
export PATH="$HOME/.local/bin:$PATH"

# Start dev server
npm run dev

# Open specific apps
open http://localhost:3000           # Web landing
open http://localhost:3000/mobile    # Mobile splash
open http://localhost:3000/partner   # Partner portal
open http://localhost:3000/admin     # Admin panel
```
