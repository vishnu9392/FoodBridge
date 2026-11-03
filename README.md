# FoodBridge — Smart Food Waste Reduction Platform

**FoodBridge** is a full-stack web platform connecting local food businesses, caterers, and donors with verified community relief organizations and hunger shelters. The platform integrates a real-time rule-based expiry intelligence engine, a multi-stage pickup reservation state machine, and donor impact analytics to rescue edible surplus food before it goes to landfills.

---

## 🚀 Key Features

1. **User Authentication & Authorization**:
   - Role-based access (`donor` and `recipient`).
   - Secure password hashing with `bcryptjs`.
   - Stateless JWT session tokens and ownership validation.
   - Profile management and password updates.

2. **Surplus Food Donation Management**:
   - Donors list surplus meals with preparation and expiry timestamps, categories, quantity, units, pickup location, photos, and dietary/allergen tags.
   - Ownership controls: donors can edit or delete their active listings.
   - Recipient view automatically filters for active, unexpired, and available donations.

3. **Rule-Based Expiry Intelligence Engine**:
   - Evaluates remaining time against dynamic thresholds:
     - 🟢 **Fresh**: More than 24 hours remaining.
     - 🟡 **Expiring Soon**: 24 hours or less remaining (urgent rescue priority with pulsing visual badges).
     - 🔴 **Expired**: Timestamp has passed (automatically removed from active listings).
   - Interactive Shelf-Life Estimator tool based on temperature storage (ambient, refrigerated, frozen).
   - Prominent food safety & date-based estimation disclaimer.

4. **Pickup & Logistics State Machine**:
   - State flow: `pending` → `approved` / `rejected` → `completed` / `cancelled`.
   - Prevents duplicate active reservations for the same donation.
   - Automatically reserves donation upon approval and frees it back to `available` if cancelled.
   - Mutual verification for completed food handovers.

5. **Donor Dashboard**:
   - Real-time KPI statistics: Total Donations, Active Available Food, Completed Rescues, Pending Requests.
   - Expiring-soon alerts for immediate action.
   - Quick one-click approval/rejection for incoming pickup requests.
   - Comprehensive donation history table.

6. **Impact & Community Showcase**:
   - Platform-wide impact metrics (kg food rescued, meals served, CO₂ emissions prevented).
   - Team introduction, process workflow, and contact form.
   - Responsive dark charcoal (#121212) and warm orange (#FF8C42) visual aesthetic.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router DOM v6, Lucide React icons, Plain CSS design system.
- **Backend**: Node.js (v24), Express.js, TypeScript, Mongoose ODM, JWT, bcryptjs, CORS, express-rate-limit.
- **Database**: MongoDB Atlas (`foodbridge` database).
- **Testing**: Node Native Test Runner with `tsx`.

---

## 📁 Project Structure

```text
FoodBridge/
├── client/                     # Frontend Application (React + Vite + TypeScript)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, FoodCard, ExpiryBadge, Modals)
│   │   ├── context/            # AuthContext (JWT session & user state)
│   │   ├── pages/              # 10 Required functional pages
│   │   ├── services/           # Centralized API service layer (Axios)
│   │   ├── styles/             # Modular CSS (variables, global, components, pages)
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Route declarations
│   │   └── main.tsx            # Root DOM mount
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                     # Backend API (Express + TypeScript + Mongoose)
│   ├── src/
│   │   ├── config/             # DB connection & environment variables
│   │   ├── controllers/        # Auth, Donation, Pickup, Dashboard, Expiry, Health
│   │   ├── middleware/         # Auth, Rate limiting, Error handling
│   │   ├── models/             # User, Donation, Pickup Mongoose schemas
│   │   ├── routes/             # REST endpoints
│   │   ├── services/           # Expiry calculation engine, Pickup state machine
│   │   ├── tests/              # Automated unit tests
│   │   ├── utils/              # Validation helpers, JWT signer, Seed script
│   │   └── index.ts            # Server entry point
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── package.json                # Root orchestration scripts
└── README.md
```

---

## ⚙️ MongoDB Atlas Configuration

You can connect your existing free MongoDB Atlas cluster in 2 minutes:

1. Open `server/.env` in your text editor.
2. Locate `MONGODB_URI=`.
3. Paste your MongoDB Atlas connection string, ensuring the database is set to `foodbridge`.

Example:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/foodbridge?retryWrites=true&w=majority
JWT_SECRET=foodbridge_dev_jwt_secret_key_college_project_2026
CLIENT_ORIGIN=http://localhost:5173
```

> **Note**: If `MONGODB_URI` is left blank, the server will start in degraded mode with an active health notification in the frontend header (`/api/health`), preventing silent fake writes.

---

## 🏃 Quick Start Guide

### 1. Install All Dependencies (One-time)
From the `FoodBridge` root folder:
```bash
npm run install:all
```
*(Or install individually: `cd server && npm install`, then `cd ../client && npm install`)*

### 2. Run Automated Verification Tests
```bash
npm test
```
*Executes all 20 unit tests for the expiry calculation rules, validation utilities, and pickup state machine.*

### 3. Build Production Bundles
```bash
npm run build
```
*Builds both the backend TypeScript to `server/dist` and frontend static assets to `client/dist`.*

### 4. Optional: Seed Sample Demo Data
Once you have entered your `MONGODB_URI` in `server/.env`:
```bash
npm run seed
```
*Populates sample verified donor & recipient accounts, fresh meals, expiring produce, and completed rescue records.*

### 5. Start the Application
Run both frontend and backend concurrently:
```bash
npm run dev
```

Alternatively, run in separate terminals:
- **Terminal 1 (Backend API)**:
  ```bash
  cd server
  npm run dev
  ```
- **Terminal 2 (Frontend Client)**:
  ```bash
  cd client
  npm run dev
  ```

---

## 🌐 Local URLs

| Service | URL |
| :--- | :--- |
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) |
| **Backend Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

---

## 🔑 Demo Accounts (Pre-configured in Login Screen)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Donor** | `donor@foodbridge.org` | `donor123` |
| **Recipient** | `shelter@foodbridge.org` | `shelter123` |

*(You can also register any new account with real-time validation via the Register page.)*

---

## 🧪 Verification Summary

- **Server Tests**: 20/20 unit tests passed (0 failures).
- **Server Compilation**: `tsc` compiled cleanly to `server/dist`.
- **Client Build**: `vite build` completed cleanly to `client/dist` (334 kB gzip: 98 kB).
- **Health Endpoint**: Reports server uptime, Node version, and MongoDB connectivity status.
