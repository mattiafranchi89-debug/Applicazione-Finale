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
const SALT_ROUNDS = 10;

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

// Helper to remove password from user object
const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
};

// Auth API
app.post('/api/auth/login', async (req, res) => {
  const usernameInput = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const passwordInput = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!usernameInput || !passwordInput) {
    return res.status(400).json({ success: false, message: 'Username e password sono obbligatori' });
  }

  const [user] = await db.select().from(users).where(eq(users.username, usernameInput));

  if (user && await bcrypt.compare(passwordInput, user.password)) {
    res.json({ success: true, user: sanitizeUser(user) });
  } else {
    res.status(401).json({ success: false, message: 'Credenziali non valide' });
  }
});

app.get('/api/auth/users', async (req, res) => {
  const allUsers = await db.select().from(users);
  res.json(allUsers.map(sanitizeUser));
});

app.post('/api/auth/users', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Check if username already exists
    const [existingUser] = await db.select().from(users).where(eq(users.username, username));
    if (existingUser) {
      return res.status(400).json({ error: 'Username già in uso. Scegline un altro.' });
    }
    
    // First user becomes admin, rest are 'user'
    const allUsers = await db.select().from(users);
    const role = allUsers.length === 0 ? 'admin' : 'user';
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [newUser] = await db.insert(users).values({ username, password: hashedPassword, email, role }).returning();
    res.json(sanitizeUser(newUser));
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.delete('/api/auth/users/:username', async (req, res) => {
  await db.delete(users).where(eq(users.username, req.params.username));
  res.json({ success: true });
});

app.put('/api/auth/users/:username/password', async (req, res) => {
  const { newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const [updated] = await db.update(users)
    .set({ password: hashedPassword })
    .where(eq(users.username, req.params.username))
    .returning();
  
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(sanitizeUser(updated));
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

async function startServer() {
  try {
    const result = await ensureAdminUser({
      forceReset: process.env.ADMIN_FORCE_RESET === 'true' || Boolean(process.env.ADMIN_PASSWORD),
    });

    if (result.action === 'created') {
      console.log(`👤 Admin user created (${result.username}).`);
    } else if (result.action === 'updated') {
      console.log(`👤 Admin user updated (${result.username}) — ${result.updatedFields.join(', ')}.`);
    } else {
      console.log(`👤 Admin user already configured (${result.username}).`);
    }
  } catch (error) {
    console.error('❌ Unable to ensure admin user exists:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
