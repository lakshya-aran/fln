# FLN Assessment Platform

A nationwide Foundational Literacy and Numeracy (FLN) assessment platform built with the MERN stack.

## Modules Built

| Module | Path | Login |
|---|---|---|
| Login | `/login` | Any role |
| Superadmin (National) | `/superadmin` | `national@fln.gov.in` |
| State Admin | `/admin` | `state@fln.gov.in` (Maharashtra) or `state.karnataka@fln.gov.in` |
| Other roles | `/dashboard/*` | teacher / principal / volunteer / block / district |

## Project Structure

```
fln-platform/
├── backend/                       # Express.js API server
│   └── src/
│       ├── superadmin/            # National admin module
│       ├── stateadmin/            # State admin module (state-scoped RBAC)
│       ├── models/                # User model
│       ├── controllers/           # Auth controller
│       ├── routes/                # Auth routes
│       ├── middleware/            # JWT auth, validators, rate limiter
│       └── services/              # JWT service
├── frontend/                      # React 19 + Vite client
│   └── src/
│       ├── pages/
│       │   ├── superadmin/        # 11 superadmin pages
│       │   └── stateadmin/        # 8 state admin pages
│       ├── components/
│       │   ├── superadmin/        # SuperAdminLayout, StatCard, PageHeader
│       │   ├── stateadmin/        # StateAdminLayout, DistrictDetailDialog, SchoolDetailDialog
│       │   └── ui/                # shadcn/ui components
│       ├── router/                # AppRouter, SuperadminRouter, StateAdminRouter
│       ├── services/              # api, auth, superadmin, stateadmin
│       ├── types/                 # shared types
│       └── context/               # AuthContext
├── shared/                        # Cross-cutting types
└── docs/                          # Documentation
```

## Prerequisites

- Node.js 18+
- MongoDB 6+
- npm 9+

## Getting Started

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start MongoDB locally (or update `MONGODB_URI`)

### 4. Seed the database

```bash
cd backend

# Main users + roles
npm run seed

# Superadmin demo data (calendars, curriculum, questions, feedback, etc.)
npx tsx src/superadmin/seed.ts

# State admin demo data (7 districts, 28 schools, infrastructure requests)
npx tsx src/stateadmin/seed.ts
```

### 5. Run the application

```bash
# Terminal 1
cd backend && npm run dev     # port 5000

# Terminal 2
cd frontend && npm run dev    # port 5173
```

Open http://localhost:5173.

## Test Accounts (password: `asdf@ghjk`)

| Role | Email | State | Module |
|---|---|---|---|
| Teacher | `teacher@fln.gov.in` | — | `/dashboard/teacher` |
| Principal | `principal@fln.gov.in` | Maharashtra | `/dashboard/principal` |
| Volunteer | `volunteer@fln.gov.in` | — | `/dashboard/volunteer` |
| Block Officer | `block@fln.gov.in` | — | `/dashboard/block` |
| District Officer | `district@fln.gov.in` | — | `/dashboard/district` |
| **State Admin** | `state@fln.gov.in` | Maharashtra | **`/admin`** |
| State Admin | `state.karnataka@fln.gov.in` | Karnataka | `/admin` (empty data) |
| **National Admin** | `national@fln.gov.in` | All India | **`/superadmin`** |

## State Admin Module

The state admin manages all FLN activity within one State/UT. The middleware enforces state isolation - Karnataka admin can never see Maharashtra data.

**Features:**
- Dashboard with state-level stats and charts
- District management with drill-down
- District admin CRUD with login history & password reset
- School search/filter/sort with drill-down
- Locked school recovery with audit log
- Low performance monitor (districts below 40% FLN)
- State analytics (district comparison, learning trends, radar)
- Reports (CSV downloads: state summary, district, school, volunteer, assessment, certification)

**State-scoped RBAC:** `requireStateAdmin` middleware looks up the user's `assignedState` from DB and injects it into `req.user`. Every controller then filters by `state` automatically.

## API Endpoints

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET  /api/v1/auth/me`

### Superadmin (national_admin)
- `GET    /api/v1/superadmin/dashboard`
- `GET    /api/v1/superadmin/analytics`
- `GET    /api/v1/superadmin/calendar`, `POST`, `PUT /:id`
- `GET    /api/v1/superadmin/curriculum`, `POST`, `PUT /:id`
- `GET    /api/v1/superadmin/question-review`, `PUT /:id`
- `GET    /api/v1/superadmin/visual-assets`, `POST`, `PUT /:id/replace`
- `GET    /api/v1/superadmin/feedback`, `PUT /:id`
- `GET    /api/v1/superadmin/announcements`, `POST`, `PUT /:id`
- `POST   /api/v1/superadmin/unlock-school`
- `GET    /api/v1/superadmin/audit`
- ... (full list in `backend/src/superadmin/routes/index.ts`)

### State Admin (state_admin)
- `GET    /api/v1/admin/dashboard`
- `GET    /api/v1/admin/dashboard/charts`
- `GET    /api/v1/admin/districts`
- `GET    /api/v1/admin/districts/low-performing`
- `GET    /api/v1/admin/districts/certification`
- `GET    /api/v1/admin/districts/:id`
- `GET    /api/v1/admin/schools`
- `GET    /api/v1/admin/schools/locked`
- `GET    /api/v1/admin/schools/:id`
- `GET    /api/v1/admin/district-admin`
- `POST   /api/v1/admin/district-admin`
- `PUT    /api/v1/admin/district-admin/:id`
- `PATCH  /api/v1/admin/district-admin/:id/deactivate`
- `POST   /api/v1/admin/district-admin/:id/reset-password`
- `GET    /api/v1/admin/district-admin/:id/login-history`
- `POST   /api/v1/admin/unlock-school`
- `GET    /api/v1/admin/infrastructure-requests`
- `GET    /api/v1/admin/reports?type=...`

## Security

- bcrypt (12 rounds) password hashing
- JWT access (15m) + refresh tokens (7d)
- HTTP-only cookies for refresh
- Rate limiting (auth 10/15min, api 100/15min)
- Helmet security headers
- CORS restricted
- Zod validation on all inputs
- Role-based access control (national_admin / state_admin enforced server-side)
- State-scoped data filtering (state admin cannot access other states)
- Immutable audit logs for every privileged action

## Tech Stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router 6, React Hook Form, Zod, Axios, TanStack React Query, recharts, react-markdown, Radix UI

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Helmet, CORS, Zod, express-rate-limit