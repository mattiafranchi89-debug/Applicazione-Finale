import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { db } from './db.js';
import { users, players, trainings, matches, callups, formations, appSettings } from '../shared/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

const app = express();
const PORT = 3001;
const SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

// Helper to remove password from user object
const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
};

// Auth API
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const [user] = await db.select().from(users).where(eq(users.username, username));
  
  if (user && await bcrypt.compare(password, user.password)) {
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
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const [newUser] = await db.insert(users).values({ username, password: hashedPassword, email, role: 'user' }).returning();
  res.json(sanitizeUser(newUser));
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

// Players API
app.get('/api/players', async (req, res) => {
  const allPlayers = await db.select().from(players);
  res.json(allPlayers);
});

app.post('/api/players', async (req, res) => {
  const [newPlayer] = await db.insert(players).values(req.body).returning();
  res.json(newPlayer);
});

app.put('/api/players/:id', async (req, res) => {
  const [updated] = await db.update(players)
    .set(req.body)
    .where(eq(players.id, parseInt(req.params.id)))
    .returning();
  res.json(updated);
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
  const [newMatch] = await db.insert(matches).values(req.body).returning();
  res.json(newMatch);
});

app.put('/api/matches/:id', async (req, res) => {
  const [updated] = await db.update(matches)
    .set(req.body)
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
