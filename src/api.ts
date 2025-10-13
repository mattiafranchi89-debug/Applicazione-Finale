import {
  INITIAL_AUTH_USERS,
  INITIAL_CALLUP,
  INITIAL_FORMATION,
  INITIAL_MATCHES,
  INITIAL_PLAYERS,
  INITIAL_SETTINGS,
  INITIAL_TRAINING_WEEKS,
} from './initialData';
import type {
  AppSettings,
  AuthUser,
  CallUpData,
  CallUpRecord,
  FormationData,
  FormationRecord,
  Match,
  Player,
  TrainingWeek,
} from './types';

export const LS_KEYS = {
  players: 'seguro_players_v1',
  trainings: 'seguro_trainings_v1',
  matches: 'seguro_matches_v1',
  callups: 'seguro_callup_v1',
  formation: 'seguro_formation_v1',
  settings: 'seguro_settings_v1',
  auth: 'seguro_auth_v1',
};

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const memoryStorage = new Map<string, string>();

const getStorage = (): StorageLike => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key);
    },
  };
};

const read = <T>(key: string): T | null => {
  const raw = getStorage().getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('Failed to parse localStorage key', key, error);
    return null;
  }
};

const write = <T>(key: string, value: T) => {
  getStorage().setItem(key, JSON.stringify(value));
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ensurePlayers = (): Player[] => {
  const stored = read<Player[]>(LS_KEYS.players);
  if (stored && Array.isArray(stored)) return stored;
  const seeded = clone(INITIAL_PLAYERS);
  write(LS_KEYS.players, seeded);
  return seeded;
};

const ensureTrainings = (): TrainingWeek[] => {
  const stored = read<TrainingWeek[]>(LS_KEYS.trainings);
  if (stored && Array.isArray(stored)) return stored;
  const seeded = clone(INITIAL_TRAINING_WEEKS);
  write(LS_KEYS.trainings, seeded);
  return seeded;
};

const ensureMatches = (): Match[] => {
  const stored = read<Match[]>(LS_KEYS.matches);
  if (stored && Array.isArray(stored)) return stored;
  const seeded = clone(INITIAL_MATCHES);
  write(LS_KEYS.matches, seeded);
  return seeded;
};

const ensureCallups = (): CallUpRecord[] => {
  const stored = read<CallUpRecord[]>(LS_KEYS.callups);
  if (stored && Array.isArray(stored) && stored.length > 0) return stored;
  const seeded: CallUpRecord[] = [{ id: 1, ...clone(INITIAL_CALLUP) }];
  write(LS_KEYS.callups, seeded);
  return seeded;
};

const ensureFormation = (): FormationRecord => {
  const stored = read<FormationRecord | null>(LS_KEYS.formation);
  if (stored && typeof stored === 'object') return stored;
  const base: FormationData = clone(INITIAL_FORMATION);
  const seeded: FormationRecord = {
    id: base.id ?? 1,
    module: base.module,
    positions: base.positions ? { ...base.positions } : {},
    substitutes: base.substitutes ? [...base.substitutes] : [null, null, null, null, null, null, null, null, null],
  };
  write(LS_KEYS.formation, seeded);
  return seeded;
};

const ensureSettings = (): AppSettings => {
  const stored = read<AppSettings>(LS_KEYS.settings);
  if (stored && typeof stored === 'object') return stored;
  const seeded = clone(INITIAL_SETTINGS);
  write(LS_KEYS.settings, seeded);
  return seeded;
};

const ensureAuthUsers = (): AuthUser[] => {
  const stored = read<AuthUser[]>(LS_KEYS.auth);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    const hasAdmin = stored.some((user) => user.username === 'admin');
    if (!hasAdmin) {
      const admin = INITIAL_AUTH_USERS[0];
      stored.push({ ...admin });
      write(LS_KEYS.auth, stored);
    }
    return stored;
  }
  const seeded = INITIAL_AUTH_USERS.map((user) => ({ ...user }));
  write(LS_KEYS.auth, seeded);
  return seeded;
};

const nextId = (items: { id: number }[]): number => {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
};

const sanitizeUsers = (users: AuthUser[]): AuthUser[] =>
  users.map(({ password, ...rest }) => rest);

const resetAll = () => {
  const storage = getStorage();
  Object.values(LS_KEYS).forEach((key) => storage.removeItem(key));

  const players = clone(INITIAL_PLAYERS);
  const trainings = clone(INITIAL_TRAINING_WEEKS);
  const matches = clone(INITIAL_MATCHES);
  const callups: CallUpRecord[] = [{ id: 1, ...clone(INITIAL_CALLUP) }];
  const formation: FormationRecord = {
    id: INITIAL_FORMATION.id ?? 1,
    module: INITIAL_FORMATION.module,
    positions: INITIAL_FORMATION.positions ? { ...INITIAL_FORMATION.positions } : {},
    substitutes: INITIAL_FORMATION.substitutes ? [...INITIAL_FORMATION.substitutes] : [null, null, null, null, null, null, null, null, null],
  };
  const settings = clone(INITIAL_SETTINGS);
  const users = INITIAL_AUTH_USERS.map((user) => ({ ...user }));

  write(LS_KEYS.players, players);
  write(LS_KEYS.trainings, trainings);
  write(LS_KEYS.matches, matches);
  write(LS_KEYS.callups, callups);
  write(LS_KEYS.formation, formation);
  write(LS_KEYS.settings, settings);
  write(LS_KEYS.auth, users);

  return {
    players: clone(players),
    trainings: clone(trainings),
    matches: clone(matches),
    callups: clone(callups),
    callup: clone(callups[0]),
    formation: clone(formation),
    settings: clone(settings),
    users: sanitizeUsers(users),
  };
};

export const api = {
  players: {
    getAll: async (): Promise<Player[]> => clone(ensurePlayers()),
    create: async (player: Partial<Player>): Promise<Player> => {
      const players = ensurePlayers();
      const newPlayer: Player = {
        id: nextId(players),
        firstName: player.firstName ?? '',
        lastName: player.lastName ?? '',
        number: player.number ?? (players.length > 0 ? Math.max(...players.map((p) => p.number)) + 1 : 1),
        position: (player.position ?? 'Attaccante') as Player['position'],
        goals: player.goals ?? 0,
        presences: player.presences ?? 0,
        birthYear: player.birthYear ?? 2007,
        yellowCards: player.yellowCards ?? 0,
        redCards: player.redCards ?? 0,
      };
      players.push(newPlayer);
      write(LS_KEYS.players, players);
      return clone(newPlayer);
    },
    update: async (id: number, patch: Partial<Player>): Promise<Player> => {
      const players = ensurePlayers();
      const index = players.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Player not found');
      const updated: Player = { ...players[index], ...patch };
      players[index] = updated;
      write(LS_KEYS.players, players);
      return clone(updated);
    },
    delete: async (id: number): Promise<void> => {
      const players = ensurePlayers().filter((p) => p.id !== id);
      write(LS_KEYS.players, players);
    },
  },
  trainings: {
    getAll: async (): Promise<TrainingWeek[]> => clone(ensureTrainings()),
    create: async (training: Partial<TrainingWeek>): Promise<TrainingWeek> => {
      const trainings = ensureTrainings();
      const newWeek: TrainingWeek = {
        id: nextId(trainings),
        weekNumber: training.weekNumber ?? trainings.length + 1,
        weekLabel: training.weekLabel ?? `Settimana ${trainings.length + 1}`,
        sessions: training.sessions ? clone(training.sessions) : [],
      };
      trainings.push(newWeek);
      write(LS_KEYS.trainings, trainings);
      return clone(newWeek);
    },
    update: async (id: number, patch: Partial<TrainingWeek>): Promise<TrainingWeek> => {
      const trainings = ensureTrainings();
      const index = trainings.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Training week not found');
      const updated: TrainingWeek = {
        ...trainings[index],
        ...patch,
        sessions: patch.sessions ? clone(patch.sessions) : trainings[index].sessions,
      };
      trainings[index] = updated;
      write(LS_KEYS.trainings, trainings);
      return clone(updated);
    },
  },
  matches: {
    getAll: async (): Promise<Match[]> => clone(ensureMatches()),
    create: async (match: Partial<Match>): Promise<Match> => {
      const matches = ensureMatches();
      const newMatch: Match = {
        id: nextId(matches),
        round: match.round ?? matches.length + 1,
        date: match.date ?? new Date().toISOString().slice(0, 10),
        time: match.time ?? '15:00',
        home: match.home ?? 'Seguro',
        away: match.away ?? 'Avversari',
        address: match.address ?? '',
        city: match.city ?? '',
        result: match.result,
        events: match.events ? clone(match.events) : [],
        minutes: match.minutes ? { ...match.minutes } : {},
      };
      matches.push(newMatch);
      write(LS_KEYS.matches, matches);
      return clone(newMatch);
    },
    update: async (id: number, match: Partial<Match>): Promise<Match> => {
      const matches = ensureMatches();
      const index = matches.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Match not found');
      const updated: Match = {
        ...matches[index],
        ...match,
        events: match.events ? clone(match.events) : matches[index].events,
        minutes: match.minutes ? { ...match.minutes } : matches[index].minutes,
      };
      matches[index] = updated;
      write(LS_KEYS.matches, matches);
      return clone(updated);
    },
  },
  callups: {
    getAll: async (): Promise<CallUpRecord[]> => clone(ensureCallups()),
    create: async (callup: CallUpData): Promise<CallUpRecord> => {
      const callups = ensureCallups();
      const newCallup: CallUpRecord = {
        id: nextId(callups),
        opponent: callup.opponent,
        date: callup.date,
        meetingTime: callup.meetingTime,
        kickoffTime: callup.kickoffTime,
        location: callup.location,
        isHome: callup.isHome,
        selectedPlayers: Array.isArray(callup.selectedPlayers) ? [...callup.selectedPlayers] : [],
      };
      callups.push(newCallup);
      write(LS_KEYS.callups, callups);
      return clone(newCallup);
    },
    update: async (id: number, callup: Partial<CallUpData>): Promise<CallUpRecord> => {
      const callups = ensureCallups();
      const index = callups.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Callup not found');
      const updated: CallUpRecord = {
        ...callups[index],
        ...callup,
        selectedPlayers: callup.selectedPlayers ? [...callup.selectedPlayers] : callups[index].selectedPlayers,
      };
      callups[index] = updated;
      write(LS_KEYS.callups, callups);
      return clone(updated);
    },
  },
  formations: {
    getLatest: async (): Promise<FormationRecord | null> => clone(ensureFormation()),
    create: async (formation: FormationData): Promise<FormationRecord> => {
      const current = ensureFormation();
      const newFormation: FormationRecord = {
        id: current ? current.id + 1 : 1,
        module: formation.module,
        positions: formation.positions ? { ...formation.positions } : {},
        substitutes: formation.substitutes ? [...formation.substitutes] : [null, null, null, null, null, null, null, null, null],
      };
      write(LS_KEYS.formation, newFormation);
      return clone(newFormation);
    },
    update: async (id: number, formation: FormationData): Promise<FormationRecord> => {
      const current = ensureFormation();
      if (current.id !== id) {
        throw new Error('Formation not found');
      }
      const updated: FormationRecord = {
        id,
        module: formation.module,
        positions: formation.positions ? { ...formation.positions } : current.positions,
        substitutes: formation.substitutes ? [...formation.substitutes] : current.substitutes,
      };
      write(LS_KEYS.formation, updated);
      return clone(updated);
    },
  },
  settings: {
    get: async (): Promise<AppSettings> => clone(ensureSettings()),
    update: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
      const current = ensureSettings();
      const updated = { ...current, ...settings };
      write(LS_KEYS.settings, updated);
      return clone(updated);
    },
  },
  auth: {
    login: async (username: string, password: string) => {
      const users = ensureAuthUsers();
      const normalizedUsername = username.trim().toLowerCase();
      const user = users.find((u) => u.username.trim().toLowerCase() === normalizedUsername);
      if (user && user.password === password) {
        const { password: _pw, ...rest } = user;
        return { success: true, user: rest };
      }
      return { success: false };
    },
    getUsers: async (): Promise<AuthUser[]> => sanitizeUsers(ensureAuthUsers()),
    createUser: async (username: string, password: string, email: string): Promise<AuthUser> => {
      const users = ensureAuthUsers();
      const normalized = username.trim().toLowerCase();
      if (users.some((u) => u.username.trim().toLowerCase() === normalized)) {
        throw new Error('User already exists');
      }
      const newUser: AuthUser = { username: username.trim(), password, email: email.trim(), role: 'user' };
      users.push(newUser);
      write(LS_KEYS.auth, users);
      const { password: _pw, ...rest } = newUser;
      return rest;
    },
    deleteUser: async (username: string): Promise<void> => {
      const users = ensureAuthUsers();
      const filtered = users.filter((u) => u.username !== username);
      write(LS_KEYS.auth, filtered);
    },
    updatePassword: async (username: string, newPassword: string): Promise<void> => {
      const users = ensureAuthUsers();
      const index = users.findIndex((u) => u.username === username);
      if (index === -1) throw new Error('User not found');
      users[index] = { ...users[index], password: newPassword };
      write(LS_KEYS.auth, users);
    },
  },
  utils: {
    resetAll: async () => resetAll(),
  },
};
