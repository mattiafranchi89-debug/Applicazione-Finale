# Seguro Calcio U19 - Team Management System

## Overview
A comprehensive React-based web application for managing a U19 soccer team. The system helps track players, training attendance, match events, call-ups, and team statistics.

## Technology Stack
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.6
- **Styling**: Tailwind CSS 3.4.12
- **Icons**: Lucide React
- **Storage**: Browser localStorage for data persistence

## Project Structure
```
/
├── src/
│   ├── App.tsx          # Main application component with all features
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind directives
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration (configured for Replit)
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Key Features

### 1. Dashboard
- Overview of team statistics (players, matches played, total goals)
- Top scorers leaderboard
- Next match information

### 2. Player Management
- Add/remove players
- Track player statistics (goals, assists, minutes played)
- Monitor training attendance percentage
- Player categorization by birth year:
  - 2005-2006: Older players (max 4 in call-ups)
  - 2007-2008: Regular squad players
  - 2009: Call-up only players (not eligible for training sessions)
- Special badge "Solo Conv." for 2009 players

### 3. Training Sessions
- Weekly training session tracking (Mon/Wed/Fri)
- **Inverted attendance logic**: Select only absent players, all others automatically marked present
- Red highlighting for absent players, green for present
- Historical training data with weekly views
- "Chiudi allenamento" button to finalize attendance
- Ability to add new training weeks
- 2009 players excluded from training sessions

### 4. Match Management
- Record match details (date, time, location, result)
- Track match events:
  - Goals (for both teams)
  - Yellow/Red cards
  - Substitutions
- Calculate player minutes automatically based on starting XI and substitutions
- Manual minute entry option

### 5. Call-Up System
- Select up to 20 players for matches
- Automatic validation (max 4 players born 2005-2006)
- WhatsApp integration for sending formatted call-up messages
- Organized by player position
- **Visual Formation Builder**:
  - Interactive soccer field with tactical modules (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3)
  - Visual player positioning on field
  - Drag-and-drop style player assignment to positions
  - Real-time field visualization with player numbers

### 6. External Widgets
- Tuttocampo.it integration for:
  - Live results
  - League standings
  - Top scorers

## Data Persistence
All data is stored in browser localStorage with the following keys:
- `seguro_players_v1` - Player roster
- `seguro_trainings_v1` - Training attendance data
- `seguro_selectedWeek_v1` - Currently selected training week
- `seguro_matches_v1` - Match data and events
- `seguro_callup_v1` - Call-up information
- `seguro_formation_v1` - Formation tactical data (module and player positions)

## Development

### Running Locally
```bash
npm install
npm run dev
```
The app runs on port 5000 (configured for Replit environment).

### Building for Production
```bash
npm run build
npm run preview
```

## Replit Configuration
- **Server Port**: 5000 (required for Replit)
- **Host**: 0.0.0.0 (allows external connections)
- **HMR**: Configured for Replit's proxy environment
- **Deployment**: Configured with autoscale deployment (build + preview)
- **Workflow**: Server workflow running `npm run dev` on port 5000

## Recent Changes
- **Oct 8, 2025**: GitHub Import Setup Completed
  - Successfully imported GitHub repository to Replit
  - Installed all npm dependencies (174 packages)
  - Created .gitignore for Node.js/Replit environment
  - Updated vite.config.ts to remove restrictive allowedHosts (now accepts all hosts)
  - Configured Server workflow for development (npm run dev on port 5000)
  - Configured deployment settings (autoscale with build and preview)
  - Verified app is running correctly with login page displaying
- **Oct 8, 2025**: Call-Up Only Players & Inverted Training Attendance
  - Implemented call-up only logic for 2009 players:
    - Players born in 2009 can be added to the roster but only for match call-ups
    - They do NOT appear in training sessions
    - Training statistics show "—" for these players
    - Purple badge "Solo Conv." displayed in player list
  - Inverted training attendance system:
    - Coaches now select only ABSENT players
    - All non-selected players are automatically marked as PRESENT
    - Red highlighting for absent players, green for present
    - Statistics automatically calculated with inverted logic
  - Added "Chiudi allenamento" button to finalize training sessions

- **Oct 8, 2025**: Authentication and Password Recovery System
  - Implemented login system with localStorage-based authentication
  - **Admin Initial Credentials**: 
    - Username: `admin`
    - Password: `admin2024`
    - Email: mattia.franchi89@gmail.com
  - User management panel for admin:
    - Add new users
    - Automatic email template generation with credentials
    - Copy-to-clipboard functionality for sending credentials to new users
    - Reset user passwords
    - Delete non-admin users
  - Password recovery feature:
    - "Password dimenticata?" link in login page
    - Instructions to contact admin for password reset
    - Admin can reset any user's password via dedicated UI
  - New user onboarding:
    - When admin creates a user, system shows email template with credentials
    - Template can be copied and sent manually to the new user
    - User receives username, password, and login link
  - Authentication data persisted in localStorage (seguro_auth_v1)
  - **Security Note**: Passwords stored in plaintext in localStorage (suitable for local team management, not for sensitive data)

- **Oct 8, 2025**: Visual Formation Builder
  - Added interactive formation builder in Convocazione section
  - Support for 5 tactical modules (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3)
  - Visual soccer field with SVG rendering
  - Player assignment to positions with dropdown selectors
  - Formation data persisted in localStorage
  - Fixed missing Classifica (standings) widget
  - Meeting time automatically set to 90 minutes before kickoff

- **Oct 7, 2025**: Initial Replit setup
  - Configured Vite for Replit environment (port 5000, proper HMR settings)
  - Fixed syntax errors in template literals
  - Added .gitignore for Node.js
  - Removed duplicate Terza-prova folder
  - Configured deployment settings
  - Implemented complete fixture list (26 matches)
  - Enhanced callup section with auto-filling match details

## User Preferences
(To be updated as preferences are learned)

## Notes
- The app is in Italian, designed for managing "Seguro Calcio U19" team
- Reset functionality available to clear all local data
- Responsive design works on mobile and desktop
