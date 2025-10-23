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
- **Dashboard**: Overview of team statistics, top scorers, disciplinary actions (yellow/red cards), and next match information.
- **Player Management**: Features for adding/removing players, tracking individual statistics (goals, minutes, cards), and monitoring training attendance. Players are categorized by birth year, with special handling for 2009 players.
- **Training Sessions**: Tracks weekly attendance (select absent players, others are present) with historical data and session finalization. 2009 players are excluded from training.
- **Match Management**: Records match details, results, and events (goals, cards, substitutions). Player minutes and card statistics are calculated automatically.
- **Call-Up System**: Allows selection of up to 20 players with validation rules (e.g., max 4 older players). Includes WhatsApp integration for sharing call-ups and an interactive **Visual Formation Builder** with various tactical modules (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3) for visual player positioning.
- **Data Export (CSV)**: Provides export functionality for comprehensive training attendance and player statistics.

**Technical Implementations:**
- **Full Cross-Device Synchronization**: All application data (players, trainings, matches, call-ups, formations, settings) is stored exclusively in a PostgreSQL database (Neon) with Drizzle ORM, ensuring no localStorage dependencies.
- **API Proxy**: Vite is configured to proxy `/api` requests to the Express backend.
- **Database Seeding**: Scripts are available for seeding core application data.
- **Deployment Architecture**: Configured for Replit autoscale deployment, with the Express backend serving both API endpoints and static frontend files from a single unified server in production.

**System Design Choices:**
- **PostgreSQL Database Schema**: All application data is persisted in a PostgreSQL database (Neon). Key tables include:
    - `players`: Player roster, performance tracking (position, goals, presences, yellowCards, redCards).
    - `trainings`: Weekly training attendance.
    - `matches`: Match fixtures, results, and events.
    - `callups`: Match call-up information including selected players, opponent, date, meetingTime, kickoffTime, and location.
    - `formations`: Tactical formation data including module and player positions.
    - `settings`: Application preferences.
- **REST API Endpoints**: Complete CRUD operations are available for all data entities, accessible via `/api/players`, `/api/trainings`, `/api/matches`, `/api/callups`, `/api/formations`, and `/api/settings`.

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

### October 10, 2025 - Database Reset & WhatsApp Message Enhancement
**Empty Database Start & Home/Away Indicator**

- **Database Configuration**:
  - Removed auto-seeding for players and trainings (database now starts empty)
  - Players list initializes as empty array instead of pre-populated data
  - Database tables emptied: players (0 records), trainings (0 records)

- **Training Management Enhancement**:
  - Fixed `addNewWeek` to handle empty trainings array gracefully
  - First week now starts from current date when database is empty
  - Subsequent weeks calculate dates based on previous week's sessions
  - Added user-friendly empty state message in TrainingsTab
  - Prevents crashes when no training weeks exist

- **Call-Up System Enhancement**:
  - Added `isHome` boolean field to CallUpData type
  - Extended `callups` table with `is_home` column (boolean, default true)
  - `handleMatchChange` automatically determines home/away status from match data
  - WhatsApp message now shows: `{opponent} (Casa)` or `{opponent} (Trasferta)`
  - Removed "SEGURO" from convocation message title as requested
  - Field persisted end-to-end via Drizzle ORM (camelCase → snake_case conversion)

- **User Experience**:
  - Empty trainings list shows clear instructions to create first week
  - Call-up form automatically sets home/away based on selected match
  - WhatsApp preview correctly indicates venue with Italian labels

- **Technical Implementation**:
  - Schema migration executed via `npm run db:push`
  - Type safety maintained across frontend and database layer
  - Backend API handles new `isHome` field without additional changes (Drizzle auto-conversion)

### October 10, 2025 - Yellow and Red Cards Feature
**Complete Cards Tracking System**

- **Database Schema**: Extended players table with yellowCards and redCards columns
- **Dashboard**: Added "🟨🟥 Ammonizioni ed Espulsioni" section with total cards and top 5 disciplined players
- **Player Tables**: Added 🟨 and 🟥 columns showing individual card counts
- **Automatic Tracking**: Cards synced from match events with database persistence
- **Bug Fix**: Cards and goals reset correctly when events are removed

### October 10, 2025 - Player Management Fix & Edit Feature
**Fixed Add Player Bug and Added Edit Functionality**

- **Database Schema Alignment**:
  - Renamed `role` → `position` to match frontend expectations
  - Removed unused `assists` and `minutesPlayed` columns
  - Added `presences` column for tracking player attendance
  - SQL migrations executed to update existing database structure
  
- **Add Player Fix**:
  - Fixed bug preventing player addition due to schema mismatch
  - Updated API payload to send correct fields: firstName, lastName, number, position, goals, presences, yellowCards, redCards, birthYear
  - Backend now accepts and persists new players without errors
  
- **Edit Player Feature**:
  - Added complete edit functionality for existing players
  - New "Modifica" (Edit) button in player tables (both regular and 2009 players)
  - Edit form allows modification of: firstName, lastName, number, position, birthYear
  - Update preserves player statistics (goals, cards, presences)
  - Cancel button to abort edits and reset form state
  
- **Field Name Conversion Fix**:
  - Added camelCase ↔ snake_case conversion helpers in backend
  - Frontend uses camelCase (firstName, lastName, etc.)
  - Database uses snake_case (first_name, last_name, etc.)
  - Automatic conversion ensures data consistency between frontend and database
  - Prevents crashes when editing/adding players
  
- **UI Enhancements**:
  - Edit form appears above player tables when editing
  - Form includes number field for jersey number updates
  - Clear visual distinction between add and edit modes
  - Proper state management to prevent conflicts between add/edit modes
  
- **Database Auto-Population Fix**:
  - Added automatic database seeding on first app load
  - If database is empty, initial players are automatically saved with valid IDs
  - Prevents "player not found" errors when editing
  - Ensures consistent data between frontend and database from first launch
  
- **Improved Error Handling**:
  - Added try-catch block in updatePlayer function
  - App no longer crashes on failed updates
  - User-friendly error messages displayed via alert
  - Better debugging with console error logging
  
- **Drizzle ORM Field Mapping Fix** (October 10, 2025):
  - Removed redundant camelCase/snake_case conversion functions
  - Drizzle ORM automatically handles field name conversion between JavaScript (camelCase) and PostgreSQL (snake_case)
  - Fixed POST /api/players endpoint that was double-converting field names causing INSERT failures
  - Fixed GET /api/players endpoint to return data directly from Drizzle
  - Fixed PUT /api/players/:id endpoint to use Drizzle's automatic conversion
  - Root cause: Backend was manually converting camelCase to snake_case, but Drizzle schema already defines this mapping
  
- **Testing**:
  - ✅ Database schema successfully aligned with frontend types
  - ✅ Add player functionality verified working (fixed double conversion bug)
  - ✅ Edit player functionality implemented and tested
  - ✅ Field conversion working correctly (Drizzle ORM handles it automatically)
  - ✅ Database auto-population working correctly
  - ✅ Error handling prevents crashes
  - ✅ Backend running without errors
  - ✅ All workflows operational
  - ✅ Player creation API tested successfully (Mario Rossi added to database)
