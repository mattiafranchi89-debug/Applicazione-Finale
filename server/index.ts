import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { players, trainings, matches, callups, formations, appSettings } from '../shared/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import {
  INITIAL_CALLUP,
  INITIAL_FORMATION,
  INITIAL_MATCHES,
  INITIAL_PLAYERS,
  INITIAL_SETTINGS,
  INITIAL_TRAINING_WEEKS,
} from '../shared/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

const ensureTables = async () => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      number INTEGER NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      position TEXT NOT NULL,
      birth_year INTEGER NOT NULL,
      goals INTEGER NOT NULL DEFAULT 0,
      presences INTEGER NOT NULL DEFAULT 0,
      yellow_cards INTEGER NOT NULL DEFAULT 0,
      red_cards INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS trainings (
      id SERIAL PRIMARY KEY,
      week_number INTEGER NOT NULL,
      week_label TEXT NOT NULL,
      sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      round INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      home TEXT NOT NULL,
      away TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      result TEXT,
      events JSONB DEFAULT '[]'::jsonb,
      minutes JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS callups (
      id SERIAL PRIMARY KEY,
      opponent TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      meeting_time TEXT NOT NULL DEFAULT '',
      kickoff_time TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      is_home BOOLEAN NOT NULL DEFAULT TRUE,
      selected_players JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS formations (
      id SERIAL PRIMARY KEY,
      module TEXT NOT NULL DEFAULT '4-3-3',
      positions JSONB NOT NULL DEFAULT '{}'::jsonb,
      substitutes JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      id SERIAL PRIMARY KEY,
      selected_week INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

const seedInitialDataIfNeeded = async () => {
  await db.transaction(async (tx) => {
    const [playerCount] = await tx.select({ value: sql<number>`count(*)` }).from(players);
    if (!playerCount || Number(playerCount.value) === 0) {
      if (INITIAL_PLAYERS.length > 0) {
        await tx.insert(players).values(
          INITIAL_PLAYERS.map((player: any) => {
            const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = player;
            return {
              ...rest,
            goals: player.goals ?? 0,
            presences: player.presences ?? 0,
            yellowCards: player.yellowCards ?? 0,
            redCards: player.redCards ?? 0,
            };
          }),
        );
      }
    }

    const [trainingCount] = await tx.select({ value: sql<number>`count(*)` }).from(trainings);
    if (!trainingCount || Number(trainingCount.value) === 0) {
      if (INITIAL_TRAINING_WEEKS.length > 0) {
        await tx.insert(trainings).values(
          INITIAL_TRAINING_WEEKS.map((week) => ({
            weekNumber: week.weekNumber,
            weekLabel: week.weekLabel,
            sessions: week.sessions,
          })),
        );
      }
    }

    const [matchCount] = await tx.select({ value: sql<number>`count(*)` }).from(matches);
    if (!matchCount || Number(matchCount.value) === 0) {
      if (INITIAL_MATCHES.length > 0) {
        await tx.insert(matches).values(
          INITIAL_MATCHES.map((match) => ({
            round: match.round,
            date: match.date,
            time: match.time,
            home: match.home,
            away: match.away,
            address: match.address ?? '',
            city: match.city ?? '',
            result: match.result ?? null,
            events: Array.isArray(match.events) ? match.events : [],
            minutes: match.minutes ?? {},
          })),
        );
      }
    }

    const [callupCount] = await tx.select({ value: sql<number>`count(*)` }).from(callups);
    if (!callupCount || Number(callupCount.value) === 0) {
      await tx.insert(callups).values({
        opponent: INITIAL_CALLUP.opponent,
        date: INITIAL_CALLUP.date,
        meetingTime: INITIAL_CALLUP.meetingTime,
        kickoffTime: INITIAL_CALLUP.kickoffTime,
        location: INITIAL_CALLUP.location,
        isHome: INITIAL_CALLUP.isHome,
        selectedPlayers: Array.isArray(INITIAL_CALLUP.selectedPlayers)
          ? INITIAL_CALLUP.selectedPlayers
          : [],
      });
    }

    const [formationCount] = await tx.select({ value: sql<number>`count(*)` }).from(formations);
    if (!formationCount || Number(formationCount.value) === 0) {
      await tx.insert(formations).values({
        module: INITIAL_FORMATION.module,
        positions: INITIAL_FORMATION.positions ?? {},
        substitutes: INITIAL_FORMATION.substitutes ?? [],
      });
    }

    const [settingsCount] = await tx.select({ value: sql<number>`count(*)` }).from(appSettings);
    if (!settingsCount || Number(settingsCount.value) === 0) {
      await tx.insert(appSettings).values({
        selectedWeek: INITIAL_SETTINGS.selectedWeek,
      });
    }
  });
};

const ensureSchemaReady = async () => {
  await ensureTables();
  await seedInitialDataIfNeeded();
};

let schemaReadyPromise: Promise<void> | null = null;

const getSchemaReadyPromise = () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = ensureSchemaReady().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  return schemaReadyPromise;
};

await getSchemaReadyPromise().catch((error) => {
  console.error('Failed to prepare database schema:', error);
});

app.use(cors());
app.use(express.json());

app.use(async (_req, _res, next) => {
  try {
    await getSchemaReadyPromise();
    next();
  } catch (error) {
    next(error);
  }
});

const LEGACY_API_PREFIXES = [
  '/players',
  '/trainings',
  '/matches',
  '/callups',
  '/formations',
  '/settings',
  '/utils',
];

app.use((req, _res, next) => {
  if (!req.path.startsWith('/api/')) {
    const matchedPrefix = LEGACY_API_PREFIXES.find((prefix) => req.path.startsWith(prefix));
    if (matchedPrefix) {
      req.url = `/api${req.url}`;
    }
  }
  next();
});

// Helper to convert camelCase to snake_case for database
const camelToSnake = (obj: any) => {
  const snakeObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeObj[snakeKey] = obj[key];
  }
  return snakeObj;
};

// Helper to convert snake_case to camelCase for API responses
const snakeToCamel = (obj: any) => {
  const camelObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelObj[camelKey] = obj[key];
  }
  return camelObj;
};

const sanitizeMatchPayload = (payload: any) => {
  if (!payload) return payload;
  const { id, createdAt, updatedAt, ...rest } = payload;
  return {
    ...rest,
    result: payload.result ?? null,
    events: Array.isArray(payload.events) ? payload.events : [],
    minutes: payload.minutes ?? {},
  };
};

// Players API
app.get('/api/players', async (req, res) => {
  const allPlayers = await db.select().from(players);
  res.json(allPlayers);
});

app.post('/api/players', async (req, res) => {
  // Drizzle handles camelCase to snake_case conversion automatically
  const [newPlayer] = await db.insert(players).values(req.body).returning();
  res.json(newPlayer);
});

app.put('/api/players/:id', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }
    
    // Drizzle handles camelCase to snake_case conversion automatically
    const [updated] = await db.update(players)
      .set(req.body)
      .where(eq(players.id, parseInt(req.params.id)))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  await db.delete(players).where(eq(players.id, parseInt(req.params.id)));
  res.json({ success: true });
});

// Trainings API
app.get('/api/trainings', async (req, res) => {
  const allTrainings = await db.select().from(trainings);
  res.json(allTrainings);
});

app.post('/api/trainings', async (req, res) => {
  const [newTraining] = await db.insert(trainings).values(req.body).returning();
  res.json(newTraining);
});

app.put('/api/trainings/:id', async (req, res) => {
  const [updated] = await db.update(trainings)
    .set(req.body)
    .where(eq(trainings.id, parseInt(req.params.id)))
    .returning();
  res.json(updated);
});

// Matches API
app.get('/api/matches', async (req, res) => {
  const allMatches = await db.select().from(matches);
  res.json(allMatches);
});

app.post('/api/matches', async (req, res) => {
  const [newMatch] = await db
    .insert(matches)
    .values(sanitizeMatchPayload(req.body))
    .returning();
  res.json(newMatch);
});

app.put('/api/matches/:id', async (req, res) => {
  const [updated] = await db
    .update(matches)
    .set(sanitizeMatchPayload(req.body))
    .where(eq(matches.id, parseInt(req.params.id)))
    .returning();
  res.json(updated);
});

// Callups API
app.get('/api/callups', async (req, res) => {
  const allCallups = await db.select().from(callups);
  res.json(allCallups);
});

app.post('/api/callups', async (req, res) => {
  const { id, createdAt, updatedAt, ...insertData } = req.body;
  const [newCallup] = await db.insert(callups).values(insertData).returning();
  res.json(newCallup);
});

app.put('/api/callups/:id', async (req, res) => {
  const { id, createdAt, updatedAt, ...updateData } = req.body;
  const [updated] = await db.update(callups)
    .set(updateData)
    .where(eq(callups.id, parseInt(req.params.id)))
    .returning();
  res.json(updated);
});

// Formations API
app.get('/api/formations/latest', async (req, res) => {
  const [latestFormation] = await db.select().from(formations).orderBy(desc(formations.updatedAt)).limit(1);
  res.json(latestFormation || null);
});

app.post('/api/formations', async (req, res) => {
  const { id, createdAt, updatedAt, ...insertData } = req.body;
  const [newFormation] = await db.insert(formations).values(insertData).returning();
  res.json(newFormation);
});

app.put('/api/formations/:id', async (req, res) => {
  const { id, createdAt, updatedAt, ...updateData } = req.body;
  const [updated] = await db.update(formations)
    .set({ ...updateData, updatedAt: sql`now()` })
    .where(eq(formations.id, parseInt(req.params.id)))
    .returning();
  res.json(updated);
});

// App Settings API
app.get('/api/settings', async (req, res) => {
  const [settings] = await db.select().from(appSettings).limit(1);
  if (!settings) {
    const [newSettings] = await db.insert(appSettings).values({ selectedWeek: 1 }).returning();
    res.json(newSettings);
  } else {
    res.json(settings);
  }
});

app.put('/api/settings', async (req, res) => {
  const [settings] = await db.select().from(appSettings).limit(1);
  if (settings) {
    const { id, createdAt, updatedAt, ...updateData } = req.body;
    const [updated] = await db.update(appSettings)
      .set({ ...updateData, updatedAt: sql`now()` })
      .where(eq(appSettings.id, settings.id))
      .returning();
    res.json(updated);
  } else {
    const [newSettings] = await db.insert(appSettings).values(req.body).returning();
    res.json(newSettings);
  }
});

app.post('/api/utils/reset', async (req, res) => {
  try {
    const { callupRow, formationRow, settingsRow } = await db.transaction(async (tx) => {
      await tx.delete(callups);
      await tx.delete(formations);
      await tx.delete(matches);
      await tx.delete(trainings);
      await tx.delete(players);
      await tx.delete(appSettings);

      await tx.execute(sql`ALTER SEQUENCE players_id_seq RESTART WITH 1`);
      await tx.execute(sql`ALTER SEQUENCE trainings_id_seq RESTART WITH 1`);
      await tx.execute(sql`ALTER SEQUENCE matches_id_seq RESTART WITH 1`);
      await tx.execute(sql`ALTER SEQUENCE callups_id_seq RESTART WITH 1`);
      await tx.execute(sql`ALTER SEQUENCE formations_id_seq RESTART WITH 1`);
      await tx.execute(sql`ALTER SEQUENCE app_settings_id_seq RESTART WITH 1`);

      if (INITIAL_PLAYERS.length > 0) {
        await tx.insert(players).values(
          INITIAL_PLAYERS.map((player: any) => {
            const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = player;
            return {
              ...rest,
              goals: player.goals ?? 0,
              presences: player.presences ?? 0,
              yellowCards: player.yellowCards ?? 0,
              redCards: player.redCards ?? 0,
            };
          }),
        );
      }

      for (const week of INITIAL_TRAINING_WEEKS) {
        await tx.insert(trainings).values({
          weekNumber: week.weekNumber,
          weekLabel: week.weekLabel,
          sessions: week.sessions,
        });
      }

      for (const match of INITIAL_MATCHES) {
        await tx.insert(matches).values({
          round: match.round,
          date: match.date,
          time: match.time,
          home: match.home,
          away: match.away,
          address: match.address ?? '',
          city: match.city ?? '',
          result: match.result ?? null,
          events: Array.isArray(match.events) ? match.events : [],
          minutes: match.minutes ?? {},
        });
      }

      const [callupRow] = await tx
        .insert(callups)
        .values({
          opponent: INITIAL_CALLUP.opponent,
          date: INITIAL_CALLUP.date,
          meetingTime: INITIAL_CALLUP.meetingTime,
          kickoffTime: INITIAL_CALLUP.kickoffTime,
          location: INITIAL_CALLUP.location,
          isHome: INITIAL_CALLUP.isHome,
          selectedPlayers: Array.isArray(INITIAL_CALLUP.selectedPlayers)
            ? INITIAL_CALLUP.selectedPlayers
            : [],
        })
        .returning();

      const [formationRow] = await tx
        .insert(formations)
        .values({
          module: INITIAL_FORMATION.module,
          positions: INITIAL_FORMATION.positions ?? {},
          substitutes: INITIAL_FORMATION.substitutes ?? [],
        })
        .returning();

      const [settingsRow] = await tx
        .insert(appSettings)
        .values({ selectedWeek: INITIAL_SETTINGS.selectedWeek })
        .returning();

      return { callupRow, formationRow, settingsRow };
    });

    const playersData = await db.select().from(players);
    const trainingsData = await db.select().from(trainings).orderBy(trainings.weekNumber);
    const matchesData = await db.select().from(matches).orderBy(matches.round);
    const callupsData = await db.select().from(callups);
    const formationsData = await db.select().from(formations).orderBy(desc(formations.updatedAt));
    const [settingsData] = await db.select().from(appSettings).limit(1);

    res.json({
      players: playersData,
      trainings: trainingsData,
      matches: matchesData,
      callups: callupsData,
      callup: callupRow,
      formation: formationsData[0] ?? formationRow,
      settings: settingsData ?? settingsRow,
    });
  } catch (error) {
    console.error('Failed to reset data:', error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// Serve static files from dist folder in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing (must be after all API routes)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
