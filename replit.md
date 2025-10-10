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
- **Full Cross-Device Synchronization**: All application data (users, players, trainings, matches, call-ups, formations, settings) is stored exclusively in a PostgreSQL database (Neon) with Drizzle ORM, ensuring no localStorage dependencies.
- **Authentication**: Secure user authentication with bcrypt hashed passwords.
- **API Proxy**: Vite is configured to proxy `/api` requests to the Express backend.
- **Database Seeding**: Scripts are available for seeding initial admin user and application data.
- **Deployment Architecture**: Configured for Replit autoscale deployment, with the Express backend serving both API endpoints and static frontend files from a single unified server in production.

**System Design Choices:**
- **PostgreSQL Database Schema**: All application data is persisted in a PostgreSQL database (Neon). Key tables include:
    - `users`: User authentication and authorization.
    - `players`: Player roster, performance tracking (goals, assists, minutesPlayed, yellowCards, redCards).
    - `trainings`: Weekly training attendance.
    - `matches`: Match fixtures, results, and events.
    - `callups`: Match call-up information including selected players, opponent, date, meetingTime, kickoffTime, and location.
    - `formations`: Tactical formation data including module and player positions.
    - `settings`: Application preferences.
- **REST API Endpoints**: Complete CRUD operations are available for all data entities, accessible via `/api/users`, `/api/players`, `/api/trainings`, `/api/matches`, `/api/callups`, `/api/formations`, and `/api/settings`.

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

### October 10, 2025 - User Registration Feature
**Self-Service Account Creation**

- **Frontend Enhancements**:
  - Added toggle between login and sign-up forms in LoginPage component
  - Registration form includes: username, email, password, and password confirmation
  - Client-side validation: password length (min 6 chars) and password match
  - Responsive error/success messaging with proper backend error surfacing
  - Auto-redirect to login after successful registration (2 seconds)
  
- **Backend Improvements**:
  - Duplicate username detection with meaningful error messages
  - Proper HTTP status codes: 400 for validation errors, 500 for server errors
  - Password hashing with bcrypt (10 salt rounds)
  - New users created with 'user' role (non-admin)
  
- **Security & UX**:
  - Password fields cleared immediately after successful registration
  - All form fields cleared when switching between login/signup
  - Frontend properly checks response.ok before showing success
  - Backend errors surfaced to user with Italian messages
  
- **Testing**:
  - ✅ Registration flow tested and verified
  - ✅ Duplicate username detection working
  - ✅ Password validation working
  - ✅ Login with newly created accounts working
  
- **Configuration Fixes**:
  - Fixed Vite allowedHosts to support Replit preview (no more "Blocked request" errors)
  - Added empty request body validation in player update endpoint
  - Added player existence checks in stats update useEffects

### October 10, 2025 - Yellow and Red Cards Feature
**Complete Cards Tracking System**

- **Database Schema**: Extended players table with yellowCards and redCards columns
- **Dashboard**: Added "🟨🟥 Ammonizioni ed Espulsioni" section with total cards and top 5 disciplined players
- **Player Tables**: Added 🟨 and 🟥 columns showing individual card counts
- **Automatic Tracking**: Cards synced from match events with database persistence
- **Bug Fix**: Cards and goals reset correctly when events are removed