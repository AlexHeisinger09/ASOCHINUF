# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASOCHINUF is a full-stack web application for a Chilean football nutrition organization. It features a modern React frontend landing page with animations and authentication, paired with a Node.js/Express backend using PostgreSQL for user management and authentication.

## Development Commands

### Frontend Development
```bash
cd frontend
yarn install              # Install dependencies
yarn start               # Start dev server (http://localhost:3000 with hot reload)
yarn build               # Build optimized production bundle
yarn test                # Run tests
```

### Backend Development
```bash
cd backend
npm install              # Install dependencies
npm run dev              # Start development server with nodemon (http://localhost:5000)
npm start                # Start production server
npm run db:init          # Initialize PostgreSQL database with schema
```

## Architecture

### Frontend Stack
- **Framework:** React 19.0.0 with React Router 7.5.1
- **Build:** Create React App with Craco 7.1.0
- **Styling:** Tailwind CSS 3.4.17 with Shadcn/ui components (46+ components, New York style)
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion with scroll-based parallax effects
- **Icons:** Lucide React 0.507.0
- **HTTP:** Axios 1.8.4
- **Notifications:** Sonner 2.0.3

### Backend Stack
- **Framework:** Express.js 4.18.2 (Node.js)
- **Database:** PostgreSQL (via pg driver)
- **Connection Pooling:** Neon serverless PostgreSQL client
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Email:** Nodemailer
- **Form Validation:** Joi
- **File Upload:** Multer
- **Dev Server:** Nodemon with hot reload

### Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Home.jsx              # Main landing page (~1067 lines)
│   │   ├── LoginModal.jsx        # Login form modal
│   │   ├── AuthModal.jsx         # Registration form modal
│   │   ├── ResetPassword.jsx     # Password reset component
│   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   └── ui/                   # 46+ Shadcn/ui components
│   ├── pages/
│   │   └── Dashboard.jsx         # Protected dashboard page
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state provider
│   ├── hooks/
│   │   └── use-toast.js          # Toast notification hook
│   ├── lib/
│   │   └── utils.js              # Utility functions (cn() classname merger)
│   ├── mock.js                   # Mock data for all content
│   ├── App.js                    # Root component with routing
│   └── index.js                  # React entry point
├── public/
│   ├── logos/                    # Brand logos (PNG & SVG)
│   └── [other assets]
├── package.json
├── craco.config.js               # CRA webpack customizations
├── tailwind.config.js            # Theme variables and animations
├── components.json               # Shadcn/ui configuration
└── jsconfig.json                 # Path alias: @/* → src/*

backend/
├── config/
│   └── database.js               # PostgreSQL pool configuration
├── middleware/
│   └── auth.js                   # JWT authentication middleware
├── controllers/
│   └── authController.js         # Authentication business logic
├── routes/
│   └── auth.js                   # Authentication endpoints
├── services/
│   └── emailService.js           # Email sending service
├── scripts/
│   └── init-db.js                # Database schema initialization
├── server.js                     # Express server entry point
├── package.json
└── .env                          # Environment variables (not committed)

netlify.toml                      # Deployment configuration
```

## Key Architectural Patterns

### Data Flow
1. **Mock-Driven Frontend:** All content (courses, testimonials, org structure) comes from `src/mock.js`
2. **Monolithic Landing Page:** Home.jsx contains all sections (hero, courses, training, testimonials, org chart, footer)
3. **Animations:** Framer Motion with useScroll hooks for parallax and entrance animations
4. **Responsive Design:** Tailwind responsive classes; mobile hamburger menu; touch support detection

### Backend API Structure

**Express Routes (prefix: /api)**
```
/auth
├── POST   /registro      → Register new user
├── POST   /login         → User login (returns JWT token)
├── POST   /logout        → User logout
└── GET    /me            → Get current user (protected route)

/health
└── GET    /              → Server health check
```

**Database Schema:**
- `t_usuarios` - User accounts (email, password hash, JWT tokens)
- `t_clientes` - Client profiles
- `t_nutricionistas` - Nutritionist profiles
- `t_cursos` - Course catalog
- `t_inscripciones` - Course enrollments
- `t_datos_antropologicos` - Anthropometric measurements
- `t_excel_uploads` - Excel upload tracking

**Authentication Flow:**
1. User registers via `/api/auth/registro` with email/password
2. Password hashed with bcryptjs, stored in PostgreSQL
3. Login returns JWT token (stored in localStorage on frontend)
4. Protected routes verified by `auth.js` middleware
5. Frontend AuthContext manages token state across routes

### Component Patterns
- Shadcn/ui for consistent, accessible UI components
- Dark theme (black background with purple accents: #8c5cff, #6a3dcf)
- Glassmorphism effects and gradient overlays
- Responsive mobile-first layout

## Configuration Files

### jsconfig.json
Path alias `@/*` maps to `src/*` for cleaner imports (e.g., `@/components`, `@/hooks`).

### tailwind.config.js
- Dark mode via class strategy
- CSS variables for theme colors (primary, secondary, muted, accent)
- Custom animations (accordion up/down) via tailwindcss-animate plugin
- Border radius and spacing variables

### components.json
Shadcn/ui configuration with New York style, JSX (not TSX), Lucide icons.

### craco.config.js
- Path alias resolution
- Hot reload toggle via `DISABLE_HOT_RELOAD` env var
- Visual editing plugin support
- Health check plugin support
- Watch mode optimization (ignores node_modules, .git, build, dist)

### netlify.toml
- Build: `cd frontend && yarn install && yarn build`
- Publish: `frontend/build`
- Node 20
- SPA redirect: `/* → /index.html` (client-side routing)

## Environment Variables

### Frontend (.env)
```
REACT_APP_ENABLE_VISUAL_EDITS=true    # Enable visual editing (optional)
DISABLE_HOT_RELOAD=false              # Disable hot module replacement (optional)
REACT_APP_API_URL=http://localhost:5000  # Backend API URL (for API calls)
```

### Backend (.env)
```
# Database (PostgreSQL)
DB_HOST=localhost                     # PostgreSQL host
DB_PORT=5432                          # PostgreSQL port
DB_USER=postgres                      # Database user
DB_PASSWORD=your_password             # Database password
DB_NAME=asochinuf                     # Database name
# OR use Neon connection string:
DATABASE_URL=postgresql://user:pass@host/dbname

# Server
PORT=5000                             # Express server port
NODE_ENV=development                  # Environment (development/production)
FRONTEND_URL=http://localhost:3000    # Frontend URL for CORS

# Authentication
JWT_SECRET=your_secret_key_here       # Secret for JWT signing
JWT_EXPIRE=7d                         # Token expiration time

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com              # SMTP server
SMTP_PORT=587                         # SMTP port
SMTP_USER=your_email@gmail.com        # SMTP user
SMTP_PASS=your_app_password           # SMTP password
```

## Deployment

**Netlify Integration:**
- Automatic builds on push to main branch
- Frontend built to `frontend/build/` directory
- SPA fallback for client-side routing
- Asset manifest for cache busting

## Frontend Routes

**Current Routes (App.js):**
```
/                    → Home (landing page)
/dashboard           → Dashboard (protected - requires authentication)
/restablecer-contrasena → Password reset
```

Authentication is enforced by `ProtectedRoute` wrapper which checks for valid JWT token in localStorage.

## Content Management

**Frontend Mock Data (src/mock.js):**
Landing page content is stored in mock.js and consumed by Home.jsx:
- Hero section with rotating text animations
- 10 sponsor logos (Chilean football teams and universities)
- 3 main courses with descriptions and duration
- 4 training workshops with icons
- 3 professional testimonials with photos
- Organizational structure (2025-2027) with team member bios

To update landing page content, edit [mock.js](frontend/src/mock.js) directly. Changes appear immediately in dev mode.

## Common Development Workflows

### Add a New Frontend Route
1. Create component in `frontend/src/pages/` or `frontend/src/components/`
2. Add route to [App.js](frontend/src/App.js) in the `<Routes>` component
3. If protected, wrap with `<ProtectedRoute>` component
4. AuthContext provides token and user data via context hook

### Add a New API Endpoint
1. Create controller function in [backend/controllers/authController.js](backend/controllers/authController.js) (or new controller file)
2. Add route to [backend/routes/auth.js](backend/routes/auth.js) (or new route file)
3. Import and register route in [backend/server.js](backend/server.js) with `app.use('/api/endpoint', routeModule)`
4. Protected routes should use the `auth` middleware from [backend/middleware/auth.js](backend/middleware/auth.js)
5. Test endpoint with curl or Postman before frontend integration

### Add a New UI Component from Shadcn
```bash
cd frontend
npx shadcn-ui@latest add [component-name]
# Example: npx shadcn-ui@latest add dialog
```
Imported components are placed in `src/components/ui/`

### Test Authentication Flow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && yarn start`
3. Go to `http://localhost:3000`
4. Click login/register modal and submit credentials
5. Check browser DevTools → Application → localStorage for `token` and `user`
6. Navigate to `/dashboard` to verify protected route works

## Key Implementation Details

**Frontend Authentication (AuthContext.jsx):**
- Stores token and user data in localStorage
- Provides `login()`, `logout()`, `register()` functions via context
- Used by LoginModal, AuthModal, and Dashboard components
- ProtectedRoute checks token before rendering child component

**Backend Authentication (middleware/auth.js):**
- Validates JWT token from Authorization header
- Attaches decoded user data to `req.user`
- Returns 401 if token missing/invalid
- Required on protected endpoints in routes

**Password Reset Flow:**
- ResetPassword.jsx handles frontend form
- Backend emailService.js sends reset link (requires SMTP config)
- Token validation and new password update via auth endpoints
