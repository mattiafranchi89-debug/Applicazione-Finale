# Seguro Calcio U19 - Team Management System

## Overview
A comprehensive React-based web application designed for managing a U19 soccer team. Its core purpose is to streamline player tracking, training attendance, match event recording, call-up generation, and team statistics. The system aims to provide a centralized platform for coaches and staff to efficiently oversee team operations and performance.

## User Preferences
- The user prefers detailed explanations.
- The user prefers iterative development.
- The user prefers to be asked before major changes are made.
- The user prefers clear and concise communication.

## System Architecture
The application is built with a React frontend using TypeScript and Vite, styled with Tailwind CSS and Lucide React icons. The backend is an Express.js REST API using Node.js, with data persisted in a PostgreSQL database (Neon) managed by Drizzle ORM.

**UI/UX Decisions:**
- **Dashboard**: Provides an overview of team statistics, top scorers, and next match information.
- **Player Management**: Features adding/removing players, tracking individual statistics (goals, minutes), and monitoring training attendance. Players are categorized by birth year, with special handling for 2009 players ("Solo Conv."). Automatic goal tracking updates player stats from match events.
- **Training Sessions**: Tracks weekly attendance with an inverted logic (select absent players, others are present). Historical data and the ability to finalize sessions are included. 2009 players are excluded from training.
- **Match Management**: Records match details, results, and events (goals, cards, substitutions). Player minutes are calculated automatically.
- **Call-Up System**: Allows selection of up to 20 players with validation rules (e.g., max 4 older players). Includes WhatsApp integration for sharing call-ups and an interactive **Visual Formation Builder** with various tactical modules (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3) for visual player positioning.
- **Data Export (CSV)**: Provides export functionality for comprehensive training attendance and player statistics, compatible with Excel.

**Technical Implementations:**
- **Full Cross-Device Synchronization**: All application data (users, players, trainings, matches, call-ups, formations, settings) is stored exclusively in a PostgreSQL database (Neon) with Drizzle ORM, ensuring no localStorage dependencies for data persistence.
- **Authentication**: Secure user authentication with bcrypt hashed passwords.
- **API Proxy**: Vite is configured to proxy `/api` requests to the Express backend.
- **Database Seeding**: Scripts are available for seeding initial admin user and application data.

## Data Persistence

### PostgreSQL Database Schema
All application data is persisted in a PostgreSQL database (Neon) with complete cross-device synchronization:

- **users** - User authentication and authorization
  - `id`, `username`, `password` (bcrypt hashed), `email`, `role` (admin/user)
  - Passwords secured with bcrypt (SALT_ROUNDS=10)
  - API responses sanitized to never expose passwords

- **players** - Player roster and statistics
  - `id`, `number`, `firstName`, `lastName`, `role` (position), `birthYear`
  - `goals`, `assists`, `minutesPlayed` - Performance tracking
  - Goals automatically synced from match events

- **trainings** - Weekly training attendance
  - `id`, `weekNumber`, `weekLabel`
  - `sessions` (JSONB) - Array of sessions with day, date, and attendance data
  - Attendance stored as {playerId: boolean} per session

- **matches** - Match fixtures, results, and events
  - `id`, `round`, `date`, `time`, `home`, `away`, `address`, `city`
  - `result` - Final score (e.g., "2-1")
  - `events` (JSONB) - Array of match events (goals, cards, substitutions)

- **callups** - Match call-up information
  - `id`, `selectedPlayers` (JSONB) - Array of player IDs selected for match
  - Latest record represents current active call-up

- **formations** - Tactical formation data
  - `id`, `module` - Formation system (e.g., "4-3-3", "4-4-2")
  - `positions` (JSONB) - Player positioning on field
  - Latest record represents current active formation

- **settings** - Application preferences
  - `id`, `selectedWeek` - Currently selected training week
  - User-specific settings and preferences

### Database Seeding

**Prerequisites:**
- PostgreSQL database provisioned (Neon)
- `DATABASE_URL` environment variable configured and accessible
- Database schema pushed (`npm run db:push`)

**Execution Order:**
Two seed scripts populate fresh databases:

1. **Admin User Seed** (`npm run db:seed`)
   - Creates initial admin account
   - Default credentials: username `admin`, password `admin2024`
   - Must be run first on new database
   - Idempotent: Safe to rerun, checks for existing admin user

2. **Application Data Seed** (`npm run db:seed-data`)
   - Populates 19 players (team roster)
   - Creates 5 initial training weeks
   - Inserts 26 match fixtures
   - Run after admin user seed
   - Idempotent: Skip logic prevents duplicate inserts on rerun

**Verification:**
- Login to app with admin credentials to verify user seed
- Check Players/Trainings/Matches sections to verify data seed
- All operations logged to console for troubleshooting

**Rollback/Recovery:**
- Seeds are idempotent - safe to rerun without duplicates
- Manual cleanup if needed: Use database pane or SQL tool to delete specific records
- Full reset: Drop all tables, re-run `npm run db:push`, then both seed scripts

### REST API Endpoints
Complete CRUD operations available for all data entities:

- **Users**: `/api/users` - GET (all), POST (create), PUT/:id (update), DELETE/:id (delete)
- **Players**: `/api/players` - GET (all), GET/:id (single), POST (create), PUT/:id (update), DELETE/:id (delete)
- **Trainings**: `/api/trainings` - GET (all), GET/:id (single), POST (create), PUT/:id (update), DELETE/:id (delete)
- **Matches**: `/api/matches` - GET (all), GET/:id (single), POST (create), PUT/:id (update), DELETE/:id (delete)
- **Call-ups**: `/api/callups` - GET (latest), POST (create), PUT/:id (update)
- **Formations**: `/api/formations` - GET (latest), POST (create), PUT/:id (update)
- **Settings**: `/api/settings` - GET (latest), POST (create), PUT/:id (update)

All endpoints use JSON for request/response bodies. Authentication endpoints sanitize passwords from responses.

## External Dependencies
- **PostgreSQL (Neon)**: Cloud-hosted relational database for all data persistence.
- **Express.js**: Node.js framework for building the REST API.
- **React**: Frontend JavaScript library for building user interfaces.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Lucide React**: Icon library.
- **Tuttocampo.it**: Integrated for external widgets displaying live results, league standings, and top scorers.
- **WhatsApp**: Integration for sending formatted call-up messages.

## Recent Changes

### October 9, 2025 - Complete Database Migration
**Complete PostgreSQL Migration - Full Cross-Device Synchronization**

- **Database Backend**: Migrated ALL data from localStorage to PostgreSQL
  - Extended Drizzle ORM schema: players, trainings, matches, callups, formations, settings tables
  - Implemented comprehensive REST API endpoints for all CRUD operations (see REST API Endpoints section)
  - All data operations now async with proper error handling
  
- **Frontend Migration**: Updated entire App.tsx to use database APIs
  - Replaced localStorage read/write with async API calls
  - Implemented auto-save pattern with `dataLoaded` flag to prevent race conditions during hydration
  - All mutations (addPlayer, deletePlayer, toggleAttendance, updateMatch, etc.) now save to database
  - Settings, callups, and formations auto-save on changes after data loaded
  
- **Data Seeding System**: Created dual seed workflow for fresh database setup
  - `npm run db:seed` - Creates admin user (username: admin, password: admin2024)
  - `npm run db:seed-data` - Populates 19 players, 5 training weeks, 26 match fixtures
  - Idempotent operations with skip logic to prevent duplicate inserts
  - Execution order: Run db:seed first, then db:seed-data
  
- **Bug Fixes**:
  - Fixed Drizzle ORM timestamp handling: use `sql\`now()\`` instead of JavaScript Date objects
  - Filtered id/createdAt/updatedAt from request bodies to avoid serialization errors
  - Corrected callups and formations create/update endpoints
  
- **Migration Status**: 
  - ✅ localStorage completely retired - zero dependencies for data persistence
  - ✅ All data (users, players, trainings, matches, callups, formations, settings) in PostgreSQL
  - ✅ Complete cross-device synchronization functional
  - ✅ Backend and frontend fully integrated with database

### October 9, 2025 - Production Deployment Configuration
**Unified Backend Architecture for Deployment**

- **Deployment Architecture**: Configured for Replit autoscale deployment
  - **Build step**: `npm run build` - Compiles TypeScript and builds React frontend to `dist/`
  - **Run command**: `npm run server` - Starts Express backend on port 3001
  - Backend serves both API endpoints (`/api/*`) and static frontend files (`dist/`)
  
- **Development vs Production**:
  - **Development**: Two workflows running in parallel
    - Vite dev server (port 5000) - Frontend with HMR
    - Express backend (port 3001) - API server
    - Vite proxy forwards `/api` requests to backend
  - **Production**: Single unified server
    - Express serves static files from `dist/` folder
    - Same Express server handles API requests
    - SPA fallback route redirects all non-API requests to `index.html`
  
- **Technical Implementation**:
  - **Port Configuration**:
    - Development: Backend uses PORT=3001 (set via workflow), Vite dev server on 5000
    - Production: Backend uses PORT=5000 (env variable or default)
    - Server code: `const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000`
  - API base URL: `/api` (relative path works in both environments)
  - Static file serving: `express.static(distPath)` middleware
  - SPA routing: Custom middleware for fallback to index.html
  - Fixed Express routing error: Changed from `app.get('*')` to `app.use()` middleware to avoid path-to-regexp errors
  - Server binding: Listens on all interfaces (0.0.0.0) for Replit compatibility
  
- **Deployment Status**:
  - ✅ Build and run commands configured for autoscale deployment
  - ✅ Backend serves both API and frontend in production
  - ✅ API endpoints tested and functional (port 3001)
  - ✅ Static files served correctly with proper content types
  - ✅ Ready for production deployment on Replit

### October 9, 2025 - Database Schema Fix for Call-ups
**Resolved Blank Call-up Screen Issue**

- **Problem Identified**: Call-up screen displayed blank page due to database schema mismatch
  - CallUpData type requires: opponent, date, meetingTime, kickoffTime, location, selectedPlayers
  - Database callups table was missing: opponent, date, updatedAt columns
  - Frontend received incomplete data causing rendering failure
  
- **Solution Applied**:
  - Added missing columns via SQL: `opponent`, `date`, `updatedAt`
  - Updated existing callup record with valid default values
  - Corrected JSONB column definition for `selectedPlayers` using `.$type<number[]>()`
  - Verified API endpoint returns complete CallUpData structure
  
- **Technical Details**:
  - Used direct SQL ALTER TABLE to avoid interactive drizzle-kit prompts
  - Properly typed JSONB column for TypeScript compatibility
  - Maintained data integrity with NOT NULL constraints and sensible defaults
  
- **Status**:
  - ✅ Call-up screen schema corrected
  - ✅ All CallUpData fields present in database
  - ✅ API endpoint tested and functional
  - ✅ Frontend receives complete data structure