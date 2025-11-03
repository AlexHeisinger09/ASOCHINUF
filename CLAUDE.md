# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASOCHINUF is a full-stack web application for a Chilean football nutrition organization. It features a modern React frontend landing page with animations and a FastAPI backend with MongoDB integration.

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
pip install -r requirements.txt
# Set environment variables (see below)
uvicorn server:app --reload  # Start FastAPI server (http://localhost:8000)
```

### Code Quality
```bash
# Backend linting and formatting tools available:
black .                  # Code formatter
isort .                  # Import sorter
flake8 .                 # Linting
mypy .                   # Type checking
pytest                   # Run tests
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
- **Framework:** FastAPI (Python)
- **Database:** MongoDB with Motor (async driver)
- **Validation:** Pydantic v2
- **Auth:** PyJWT, python-jose, passlib, bcrypt
- **Testing:** pytest 8.0.0

### Directory Structure
```
frontend/
├── src/
│   ├── components/Home.jsx       # Main 1067-line landing page
│   ├── components/LoginModal.jsx # Authentication modal
│   ├── components/ui/            # 46+ Shadcn/ui components
│   ├── hooks/                    # use-toast hook
│   ├── lib/utils.js             # Utility functions (cn() classname merger)
│   ├── mock.js                  # Mock data for all content
│   ├── App.js                   # Root component with routing
│   └── index.js                 # React entry point
├── public/
│   ├── logos/                   # Brand logos (PNG & SVG)
│   └── [other assets]
├── package.json
├── craco.config.js              # CRA webpack customizations
├── tailwind.config.js           # Theme variables and animations
├── components.json              # Shadcn/ui configuration
└── jsconfig.json               # Path alias: @/* → src/*

backend/
├── server.py                    # FastAPI application
└── requirements.txt             # Python dependencies

netlify.toml                     # Deployment configuration
```

## Key Architectural Patterns

### Data Flow
1. **Mock-Driven Frontend:** All content (courses, testimonials, org structure) comes from `src/mock.js`
2. **Monolithic Landing Page:** Home.jsx contains all sections (hero, courses, training, testimonials, org chart, footer)
3. **Animations:** Framer Motion with useScroll hooks for parallax and entrance animations
4. **Responsive Design:** Tailwind responsive classes; mobile hamburger menu; touch support detection

### Backend API Structure
```
FastAPI Routes (prefix: /api)
├── GET  /              → Status endpoint
├── POST /status        → Create status check
└── GET  /status        → Retrieve all status checks
```

**Data Models:**
- `StatusCheck` (response): id, client_name, timestamp
- `StatusCheckCreate` (request): client_name
- MongoDB collection: `status_checks` with auto-timestamps

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
```

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017/  # MongoDB connection
DB_NAME=asochinuf                     # Database name
CORS_ORIGINS=http://localhost:3000    # Comma-separated allowed origins
```

### Analytics
- **PostHog:** Project key `phc_yJW1VjHGGwmCbbrtczfqqNxgBDbhlhOWcdzcIJEOTFE`, API host `https://us.i.posthog.com`
- **rrweb:** Session recording enabled for testing

## Deployment

**Netlify Integration:**
- Automatic builds on push to main branch
- Frontend built to `frontend/build/` directory
- SPA fallback for client-side routing
- Asset manifest for cache busting

## Git Workflow

**Main branch:** Production-ready code

**Recent commits:**
- 56ce272 - organigrama (org structure updates)
- 7b46167 - cambios en diseño envio a maceta (design changes)
- 70fe7ac 0 imagenes nutri (nutrition images)
- 85fd587 - testimonios (testimonials)
- c9e91e4 - mejoras (improvements)

## Content Management

**Mock data structure (src/mock.js):**
- Hero section with rotating text animations
- 10 sponsor logos (Chilean football teams and universities)
- 3 main courses with descriptions and duration
- 4 training workshops with icons
- 3 professional testimonials with photos
- Organizational structure (2025-2027) with team member bios

To update content, edit `mock.js` directly.

## Common Development Tasks

### Add a New Route
Edit [App.js](frontend/src/App.js) and add a new `<Route>` inside the `<Routes>` component.

### Add a New UI Component
Use Shadcn CLI: `cd frontend && npx shadcn-ui@latest add [component-name]`

### Add a New API Endpoint
Edit [backend/server.py](backend/server.py), define Pydantic models, and add FastAPI routes with proper CORS handling.

### Modify Landing Page Sections
All content sections are in [Home.jsx](frontend/src/components/Home.jsx) (1067 lines). Animations use Framer Motion with scroll hooks. Mock data comes from [mock.js](frontend/src/mock.js).

### Update Mock Data
Edit [src/mock.js](frontend/src/mock.js) directly—Home.jsx reads all content from this file. Changes appear immediately in dev mode.

## Notes for Future Development

- **Frontend Refactoring Opportunity:** Home.jsx is a large monolithic component; consider splitting into smaller components (HeroSection, CoursesSection, TestimonialsSection, etc.)
- **State Management:** Currently uses useState only; consider adding Context API or Redux if complex state sharing becomes necessary
- **Backend Expansion:** Current API is minimal; ready for adding authentication, course enrollment, and user data persistence
- **Type Safety:** Frontend could benefit from TypeScript or JSDoc annotations
