# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASOCHINUF is a full-stack web application for a Chilean football nutrition organization. It features a modern React frontend landing page with animations and authentication, paired with a Node.js/Express backend using PostgreSQL for user management, authentication, and anthropometric data management for football players.

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
npm run dev              # Start development server with nodemon (http://localhost:5001)
npm start                # Start production server
npm run db:init          # Initialize PostgreSQL database with schema
```

### Database Scripts
```bash
cd backend
node scripts/init-db.js              # Initialize database schema
node scripts/create-admin.js         # Create admin user
node scripts/create-test-user.js     # Create test user
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
- **Excel:** XLSX library for reading Excel files

### Backend Stack
- **Framework:** Express.js 4.18.2 (Node.js with ES modules - `"type": "module"`)
- **Database:** PostgreSQL via Neon serverless client (@neondatabase/serverless)
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Email:** Nodemailer
- **Form Validation:** Joi
- **File Upload:** Multer (10MB limit, Excel files only)
- **Excel Processing:** XLSX library for parsing anthropometric data
- **Dev Server:** Nodemon with hot reload

### Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Home.jsx              # Main landing page (~1117 lines)
│   │   ├── LoginModal.jsx        # Login form modal
│   │   ├── AuthModal.jsx         # Registration form modal
│   │   ├── Header.jsx, Sidebar.jsx, BottomNav.jsx, MainContent.jsx
│   │   └── ui/                   # 46+ Shadcn/ui components
│   ├── pages/
│   │   ├── Inicio.jsx            # Main dashboard page (section-based)
│   │   ├── DashboardSection/     # Dashboard overview
│   │   ├── ExcelSection/         # Excel upload and data management
│   │   ├── DatosSection/         # Patient data section
│   │   ├── CursosSection/        # Courses section
│   │   ├── ConfiguracionSection/ # Settings section
│   │   └── GestionUsuariosSection/ # User management (admin only)
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state + theme provider
│   ├── mock.js                   # Mock data for landing page
│   └── App.js                    # Root component with routing

backend/
├── config/
│   └── database.js               # Neon serverless PostgreSQL config
├── middleware/
│   └── auth.js                   # JWT authentication (verificarToken)
├── controllers/
│   ├── authController.js         # Authentication logic
│   └── excelController.js        # Excel upload and processing (~325 lines)
├── routes/
│   ├── auth.js                   # Auth endpoints
│   └── excel.js                  # Excel upload endpoints with Multer
├── utils/
│   └── excelParser.js            # Excel parsing and validation (~233 lines)
├── services/
│   └── emailService.js           # Email sending
├── scripts/
│   └── init-db.js                # Database initialization
└── server.js                     # Express server entry
```

## Key Architectural Patterns

### Data Flow
1. **Mock-Driven Frontend:** Landing page content (courses, testimonials, org structure) comes from `src/mock.js`
2. **Monolithic Landing Page:** Home.jsx (~1117 lines) contains all sections
3. **Modular Dashboard:** Dashboard split into section components in `pages/` directory
4. **Animations:** Framer Motion with useScroll hooks for parallax effects
5. **Theme Support:** Dark/light mode toggle via AuthContext and localStorage

### Backend API Structure

**Express Routes (prefix: /api)**
```
/auth
├── POST   /registro      → Register new user
├── POST   /login         → User login (returns JWT token)
├── POST   /logout        → User logout
└── GET    /me            → Get current user (protected)

/excel
├── POST   /upload        → Upload Excel file (nutricionistas/admin only)
├── GET    /history       → Get upload history
└── GET    /session/:id   → Get measurement session details

/health
└── GET    /              → Server health check
```

**Database Schema (PostgreSQL):**

*User Management:*
- `t_usuarios` - System users (admin, nutricionista, cliente) with authentication
- `t_clientes` - Client profiles linked to usuarios
- `t_nutricionistas` - Nutritionist profiles with specialization
- `t_recovery_tokens` - Password reset tokens

*Patient Management (separate from system users):*
- `t_pacientes` - Football players/patients (cedula, contact info, birth date)

*Content:*
- `t_cursos` - Course catalog
- `t_inscripciones` - Course enrollments

*Anthropometric Data System:*
- `t_planteles` - Football teams/squads (e.g., "Universidad de Chile")
- `t_sesion_mediciones` - Measurement sessions (date, plantel, nutritionist, file hash)
- `t_informe_antropometrico` - Anthropometric measurements with 30+ data points:
  - Basic: peso, talla, talla_sentado
  - Diameters: biacromial, torax, biiliocristal, humero, femur, etc.
  - Perimeters: brazo_relajado, brazo_contraido, antebrazo, muslo, pierna, etc.
  - Skinfolds: triceps, subescapular, supraespinal, abdominal, muslo_frontal, pierna_medial
  - Calculated: IMC, suma_6_pliegues, suma_8_pliegues

**Authentication Flow:**
1. User registers via `/api/auth/registro` with email/password
2. Password hashed with bcryptjs, stored in PostgreSQL
3. Login returns JWT token (stored in localStorage: `asochinuf_token`, `asochinuf_usuario`)
4. Protected routes verified by `verificarToken` middleware
5. Frontend AuthContext manages token state across routes
6. User types: `admin`, `nutricionista`, `cliente` (tipo_perfil column)

**Excel Upload Flow:**
1. Nutritionist/admin uploads Excel file via `/api/excel/upload` (max 10MB, .xlsx/.xls)
2. Multer stores file in memory buffer
3. `excelParser.js` validates structure and extracts:
   - Metadata: Plantel name (cell B1), session date (cell B2)
   - Patient data: Name, cedula, birth date from rows
   - Anthropometric measurements: 30+ columns
4. File hash generated (SHA-256) to detect duplicate uploads
5. Transaction creates/updates:
   - t_planteles entry (if new team)
   - t_sesion_mediciones entry (session metadata)
   - t_pacientes entries (if new patients)
   - t_informe_antropometrico entries (measurement data)
6. Duplicate detection: same plantel + fecha_sesion + hash = rejected
7. Longitudinal support: Same patient can have multiple measurements across sessions

## Configuration Files

### jsconfig.json
Path alias `@/*` maps to `src/*` for cleaner imports (e.g., `@/components`, `@/hooks`).

### components.json
Shadcn/ui configuration with New York style, JSX (not TSX), Lucide icons.

### craco.config.js
- Path alias resolution (`@/*` → `src/*`)
- Hot reload toggle via `DISABLE_HOT_RELOAD` env var
- Visual editing plugin support (optional)
- Watch mode optimization (ignores node_modules, .git, build, dist)

### netlify.toml
- Build: `cd frontend && yarn install && yarn build`
- Publish: `frontend/build`
- Node 20
- SPA redirect: `/* → /index.html` (client-side routing)

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001  # Backend API URL (Note: Port 5001)
```

### Backend (.env)
```
# Database (Neon PostgreSQL - REQUIRED)
DATABASE_URL=postgresql://user:pass@host/dbname

# Server
PORT=5001                             # Express server port (Note: 5001, not 5000)
NODE_ENV=development
FRONTEND_URL=http://localhost:3000    # Frontend URL for CORS

# Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Important:** Backend runs on port **5001** by default. AuthContext hardcodes `http://localhost:5001` for API calls.

## Frontend Routes

**Routes (App.js):**
```
/                           → Home (landing page)
/dashboard                  → Inicio (protected - requires authentication)
/restablecer-contrasena     → Password reset
```

**Dashboard Sections (tabs in Inicio.jsx):**
- **Dashboard:** Overview with statistics
- **Excel:** Upload anthropometric data, view upload history
- **Datos:** Patient data management
- **Cursos:** Course management
- **Configuración:** User settings, theme toggle
- **Gestión Usuarios:** User management (admin only)

## Content Management

**Frontend Mock Data (src/mock.js):**
Landing page content consumed by Home.jsx:
- Hero section with rotating text animations
- 10 sponsor logos (Chilean football teams and universities)
- 3 main courses with descriptions and duration
- 4 training workshops with icons
- 3 professional testimonials with photos
- Organizational structure (2025-2027) with team member bios

To update landing page content, edit [mock.js](frontend/src/mock.js).

## Common Development Workflows

### Add a New Frontend Route
1. Create component in `frontend/src/pages/` or `frontend/src/components/`
2. Add route to [App.js](frontend/src/App.js) in the `<Routes>` component
3. If protected, wrap with `<ProtectedRoute>` component
4. AuthContext provides token and user data via context

### Add a New API Endpoint
1. Create controller function in appropriate controller (e.g., [authController.js](backend/controllers/authController.js))
2. Add route to appropriate route file (e.g., [auth.js](backend/routes/auth.js))
3. Import and register in [server.js](backend/server.js) with `app.use('/api/endpoint', routeModule)`
4. Protected routes use `verificarToken` middleware from [auth.js](backend/middleware/auth.js)

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
5. Check browser DevTools → Application → localStorage for `asochinuf_token` and `asochinuf_usuario`
6. Navigate to `/dashboard` to verify protected route works

### Test Excel Upload Flow
1. Ensure backend and frontend are running
2. Login as nutricionista or admin user
3. Navigate to Dashboard → Excel tab
4. Upload Excel file (.xlsx/.xls) with structure:
   - Row 1: Plantel name in cell B1
   - Row 2: Measurement date in cell B2
   - Row 4: Column headers (Nombre, Cédula, Fecha Nacimiento, etc.)
   - Row 5+: Patient data and measurements
5. Backend validates structure, extracts data, creates session
6. View upload history and session details in Excel section

### Add New Anthropometric Measurement Column
1. Update database schema in [init-db.js](backend/scripts/init-db.js) - add column to `t_informe_antropometrico`
2. Update [excelParser.js](backend/utils/excelParser.js) - add column mapping in `columnMap`
3. Update frontend Excel section to display new field
4. Run `npm run db:init` to apply schema changes

## Key Implementation Details

**Frontend Authentication (AuthContext.jsx):**
- Stores token and user data in localStorage (`asochinuf_token`, `asochinuf_usuario`)
- Provides `login()`, `logout()`, `register()` functions via context
- Theme management with `isDarkMode` state and localStorage (`asochinuf_theme`)
- ProtectedRoute checks token before rendering

**Backend Authentication (middleware/auth.js):**
- Validates JWT token from Authorization header (`Bearer <token>`)
- Attaches decoded user data to `req.usuario` (includes id, email, tipo_perfil)
- Returns 401 if token missing/invalid
- Middleware name: `verificarToken`

**Excel Parser (utils/excelParser.js):**
- Reads Excel file using XLSX library
- Validates structure: checks Plantel (B1), Fecha (B2), Headers (row 4)
- Extracts metadata and patient rows
- Maps 30+ anthropometric measurement columns
- Generates SHA-256 file hash for duplicate detection
- Returns structured data for database insertion

**Database Connection (config/database.js):**
- Uses Neon serverless PostgreSQL client for better performance
- Wraps `neon()` function in pool-compatible interface
- Queries return `{ rows, rowCount }` for compatibility
- Connection via `DATABASE_URL` environment variable

**Password Reset Flow:**
- ResetPassword.jsx handles frontend form
- Backend emailService.js sends reset link (requires SMTP config)
- Tokens stored in `t_recovery_tokens` with expiration
