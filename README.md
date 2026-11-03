# FoodBridge — Smart Food Waste Reduction Platform

**FoodBridge** is a modern full-stack web platform connecting local food businesses, commercial kitchens, bakeries, and community donors with verified hunger relief organizations and shelters. Built with an editorial food rescue interface, FoodBridge incorporates automated expiry intelligence, interactive map-based pickup coordination, and real-time donation tracking to prevent edible food from ending up in landfills.

---

## 🚀 Key Features

1. **User Authentication & Role-Based Access**:
   - Distinct roles: `donor` and `recipient`.
   - Secure password hashing with `bcryptjs`.
   - Stateless JWT authentication tokens with client-side session persistence.
   - Comprehensive profile management and credential updates.

2. **Surplus Food Donation Management**:
   - Donors list surplus meals and grocery items with preparation and expiry timestamps, categories, quantities, units, and high-resolution photos.
   - Integrated Google Maps & OpenStreetMap geolocation picker with current GPS detection.
   - Recipient marketplace automatically displays active, unexpired, and available surplus donations.

3. **Rule-Based Expiry Intelligence Engine**:
   - Evaluates remaining shelf life dynamically:
     - 🟢 **Fresh**: More than 24 hours remaining.
     - 🟡 **Expiring Soon**: 24 hours or less remaining (pulsing visual badges for urgent rescue).
     - 🔴 **Expired**: Timestamp has passed (automatically filtered from available listings).
   - Interactive Shelf-Life Estimator based on storage conditions (ambient, refrigerated, frozen).

4. **Pickup Request & Logistics Workflow**:
   - Multi-state coordination: `pending` → `approved` / `rejected` → `completed` / `cancelled`.
   - Prevents duplicate reservations and validates available portion quantities.
   - Integrated Google Maps directions and location previews for handovers.
   - Seamless pickup management dashboard for both donors and recipients.

5. **Editorial Food Rescue User Interface**:
   - Dark charcoal (`#121212`) background with warm signature orange (`#FF8C42`) and cream (`#F5E6D3`) typography.
   - High-resolution appetizing food imagery with smooth interactions.
   - Fully responsive layout optimized for mobile, tablet, and desktop screens.

---

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router DOM v6, Lucide React icons, CSS Custom Properties.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose ODM, JWT, bcryptjs, CORS, express-rate-limit.
- **Database**: MongoDB Atlas.
- **Testing**: Node.js Native Test Runner with `tsx`.

---

## 📁 Project Structure

```text
FoodBridge/
├── client/                           # Frontend React Application
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── assets/                   # Brand assets and placeholders
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ExpiryBadge.tsx       # Dynamic expiry status indicator
│   │   │   ├── FoodCard.tsx          # Marketplace food listing card
│   │   │   ├── FoodDetailModal.tsx   # Comprehensive food detail modal
│   │   │   ├── Footer.tsx            # Global site footer
│   │   │   ├── MapLocationPicker.tsx # Interactive GPS & map selector
│   │   │   ├── MapPreview.tsx        # Embedded map & directions link
│   │   │   ├── Navbar.tsx            # Navigation bar with role indicators
│   │   │   ├── PickupModal.tsx       # Pickup request form modal
│   │   │   ├── ProtectedRoute.tsx    # Role-based route guard
│   │   │   ├── ScrollToTop.tsx       # Route change scroll restoration
│   │   │   └── SystemHealthBanner.tsx# Real-time backend status banner
│   │   ├── context/                  # AuthContext (authentication & state)
│   │   ├── hooks/                    # Custom React hooks (useDebounce)
│   │   ├── layouts/                  # Application layouts (MainLayout)
│   │   ├── pages/                    # Application pages
│   │   │   ├── AvailableFoodPage.tsx # Surplus food marketplace
│   │   │   ├── DashboardPage.tsx     # Unified donor/recipient dashboard
│   │   │   ├── DonateFoodPage.tsx    # Surplus food listing form
│   │   │   ├── ExpiryDetectionPage.tsx# Expiry intelligence & shelf-life tool
│   │   │   ├── HomePage.tsx          # Editorial landing page
│   │   │   ├── LoginPage.tsx         # User authentication login
│   │   │   ├── NotFoundPage.tsx      # 404 error page
│   │   │   ├── PickupManagementPage.tsx# Pickup coordination & history
│   │   │   ├── ProfilePage.tsx       # Account profile management
│   │   │   └── RegisterPage.tsx      # User registration form
│   │   ├── services/                 # Centralized API service layer
│   │   │   ├── api.ts                # Axios instance & token interceptor
│   │   │   ├── authService.ts        # Authentication API calls
│   │   │   ├── donationService.ts    # Food donation API calls
│   │   │   ├── expiryService.ts      # Expiry intelligence API calls
│   │   │   ├── healthService.ts      # Backend health check
│   │   │   └── pickupService.ts      # Pickup coordination API calls
│   │   ├── styles/                   # Modular CSS stylesheets
│   │   │   ├── variables.css         # Design tokens & color system
│   │   │   ├── global.css            # Base styles & typography
│   │   │   ├── components.css        # Component-specific styles
│   │   │   └── pages.css             # Page-specific layouts
│   │   ├── types/                    # Shared TypeScript interfaces
│   │   ├── utils/                    # Formatting & helper utilities
│   │   ├── App.tsx                   # Main router configuration
│   │   └── main.tsx                  # React DOM mount point
│   ├── .env.example                  # Client environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                           # Backend Express REST API
│   ├── src/
│   │   ├── config/                   # Database & environment configuration
│   │   │   ├── database.ts           # Mongoose connection & lifecycle
│   │   │   └── env.ts                # Environment variable validation
│   │   ├── controllers/              # Request & response controllers
│   │   │   ├── authController.ts     # Login, register, profile
│   │   │   ├── dashboardController.ts# Metrics & recent activities
│   │   │   ├── donationController.ts # CRUD for food donations
│   │   │   ├── expiryController.ts   # Shelf-life estimation
│   │   │   ├── healthController.ts   # Diagnostics & database status
│   │   │   ├── pickupController.ts   # Pickup request coordination
│   │   │   └── seedController.ts     # Database seed handler
│   │   ├── middleware/               # Express middleware
│   │   │   ├── authMiddleware.ts     # JWT validation & role check
│   │   │   ├── dbGuard.ts            # 503 guard when database disconnected
│   │   │   ├── errorHandler.ts       # Centralized error responses
│   │   │   └── rateLimiter.ts        # Express rate limiting
│   │   ├── models/                   # Mongoose database models
│   │   │   ├── Donation.ts           # Food donation schema
│   │   │   ├── Pickup.ts             # Pickup reservation schema
│   │   │   └── User.ts               # User account schema
│   │   ├── routes/                   # API route definitions
│   │   │   ├── authRoutes.ts         # /api/auth
│   │   │   ├── dashboardRoutes.ts    # /api/dashboard
│   │   │   ├── donationRoutes.ts     # /api/donations
│   │   │   ├── expiryRoutes.ts       # /api/expiry
│   │   │   ├── healthRoutes.ts       # /api/health
│   │   │   ├── pickupRoutes.ts       # /api/pickups
│   │   │   └── index.ts              # Root /api router
│   │   ├── services/                 # Core business logic
│   │   │   ├── expiryService.ts      # Expiry computation algorithms
│   │   │   └── pickupService.ts      # Pickup transition validations
│   │   ├── tests/                    # Automated unit tests
│   │   │   ├── expiryService.test.ts # Expiry rule test suite
│   │   │   ├── pickupState.test.ts   # State machine test suite
│   │   │   └── validation.test.ts    # Input validation test suite
│   │   ├── types/                    # Backend TypeScript interfaces
│   │   ├── utils/                    # Utility functions
│   │   │   ├── jwt.ts                # Token generation & verification
│   │   │   ├── seed.ts               # Idempotent demo dataset seeder
│   │   │   └── validation.ts         # Input validation helpers
│   │   ├── app.ts                    # Express application configuration
│   │   ├── server.ts                 # HTTP server & database startup
│   │   └── index.ts                  # Server entry point
│   ├── .env.example                  # Server environment template
│   ├── package.json
│   └── tsconfig.json
├── package.json                      # Root workspace scripts
└── README.md
```

---

## ⚙️ Environment Configuration

### Server Environment (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/foodbridge?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_change_in_production
CLIENT_ORIGIN=http://localhost:5173
```

### Client Environment (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=optional_google_maps_api_key
```

---

## 🏃 Quick Start Guide

### 1. Install Dependencies
From the project root:
```bash
npm run install:all
```

### 2. Run Automated Tests
```bash
npm test
```
*Runs all 20 automated unit tests for expiry detection, input validation, and pickup state transitions.*

### 3. Build for Production
```bash
npm run build
```
*Compiles the TypeScript backend into `server/dist` and bundles the React frontend into `client/dist`.*

### 4. Seed Demo Data (Optional)
```bash
npm run seed
```
*Populates sample verified community kitchens, shelters, and surplus food listings.*

### 5. Start Development Servers
```bash
npm run dev
```
Starts both the frontend on `http://localhost:5173` and backend on `http://localhost:5000`.

---

## 🔑 Demo Accounts

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@foodbridge.demo` | `FoodBridge@Demo2026` | Metro Community Kitchen & Bakery |
| **Recipient** | `recipient@foodbridge.demo` | `FoodBridge@Demo2026` | Hope Community Shelter & Food Bank |
| **Donor (Restaurant)** | `restaurant@foodbridge.demo` | `FoodBridge@Demo2026` | Bella Trattoria & Artisan Pantry |

---

## 🚀 Deployment Overview

1. **Backend Deployment (e.g. Render, Railway, AWS ECS)**:
   - Command: `npm --prefix server run build && npm --prefix server start`
   - Set environment variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`.
2. **Frontend Deployment (e.g. Vercel, Netlify, Cloudflare Pages)**:
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set environment variable: `VITE_API_URL`.
