import {
  INITIAL_CALLUP,
  INITIAL_FORMATION,
  INITIAL_MATCHES,
  INITIAL_PLAYERS,
  INITIAL_SETTINGS,
  INITIAL_TRAINING_WEEKS,
} from './initialData';
import type {
  AppSettings,
  CallUpData,
  CallUpRecord,
  FormationData,
  FormationRecord,
  Match,
  Player,
  TrainingWeek,
} from './types';

const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  '/api';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const buildUrl = (path: string) => `${API_BASE}${path}`;

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    credentials: options.credentials ?? 'same-origin',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API ${options.method ?? 'GET'} ${path} failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return undefined as T;
};

const normaliseMatch = (match: any): Match => ({
  ...match,
  events: Array.isArray(match?.events) ? match.events : [],
  minutes: match?.minutes ? { ...match.minutes } : {},
});

const normaliseCallup = (callup: any): CallUpRecord => ({
  ...callup,
  selectedPlayers: Array.isArray(callup?.selectedPlayers) ? callup.selectedPlayers : [],
});

const normaliseFormation = (formation: any): FormationRecord => ({
  ...formation,
  positions: formation?.positions ? { ...formation.positions } : {},
  substitutes: Array.isArray(formation?.substitutes) ? [...formation.substitutes] : [null, null, null, null, null, null, null, null, null],
});

const computePlayerStatsFromMatches = (playersData: Player[], matchesData: Match[]): Player[] => {
  if (playersData.length === 0) {
    return playersData.map((player) => ({ ...player }));
  }

  const goalsByPlayer = new Map<number, number>();
  const yellowsByPlayer = new Map<number, number>();
  const redsByPlayer = new Map<number, number>();

  matchesData.forEach((match) => {
    if (!Array.isArray(match.events)) return;

    match.events.forEach((event) => {
      if (!event || event.team !== 'SEGURO') return;
      const playerId = (event as any).playerId as number | undefined;
      if (!playerId) return;

      if (event.type === 'GOAL') {
        goalsByPlayer.set(playerId, (goalsByPlayer.get(playerId) ?? 0) + 1);
      } else if (event.type === 'YELLOW') {
        yellowsByPlayer.set(playerId, (yellowsByPlayer.get(playerId) ?? 0) + 1);
      } else if (event.type === 'RED') {
        redsByPlayer.set(playerId, (redsByPlayer.get(playerId) ?? 0) + 1);
      }
    });
  });

  return playersData.map((player) => ({
    ...player,
    goals: goalsByPlayer.get(player.id) ?? player.goals ?? 0,
    yellowCards: yellowsByPlayer.get(player.id) ?? player.yellowCards ?? 0,
    redCards: redsByPlayer.get(player.id) ?? player.redCards ?? 0,
  }));
};

const persistPlayerStatDiffs = async (current: Player[], computed: Player[]) => {
  const currentById = new Map(current.map((player) => [player.id, player]));
  const updates: Promise<unknown>[] = [];

  computed.forEach((player) => {
    const baseline = currentById.get(player.id);
    if (!baseline) return;

    if (
      baseline.goals !== player.goals ||
      baseline.yellowCards !== player.yellowCards ||
      baseline.redCards !== player.redCards
    ) {
      updates.push(
        request<unknown>(`/players/${player.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            goals: player.goals,
            yellowCards: player.yellowCards,
            redCards: player.redCards,
          }),
        }),
      );
    }
  });

  if (updates.length > 0) {
    await Promise.all(updates);
  }
};

const fetchPlayersWithSyncedStats = async (): Promise<Player[]> => {
  const [playersData, matchesDataRaw] = await Promise.all([
    request<Player[]>('/players'),
    request<Match[]>('/matches'),
  ]);

  const matchesData = matchesDataRaw.map(normaliseMatch);
  const computed = computePlayerStatsFromMatches(playersData, matchesData);
  await persistPlayerStatDiffs(playersData, computed);
  return computed;
};

const sanitizeMatchForRequest = (match: Partial<Match>): Partial<Match> => ({
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

const sanitizeCallupForRequest = (callup: Partial<CallUpData>): Partial<CallUpData> => {
  const sanitized: Partial<CallUpData> = { ...callup };
  if (callup.selectedPlayers !== undefined) {
    sanitized.selectedPlayers = Array.isArray(callup.selectedPlayers)
      ? [...callup.selectedPlayers]
      : [];
  }
  return sanitized;
};

const sanitizeFormationForRequest = (formation: FormationData): FormationData => ({
  module: formation.module,
  positions: formation.positions ? { ...formation.positions } : {},
  substitutes: formation.substitutes ? [...formation.substitutes] : [null, null, null, null, null, null, null, null, null],
});

export const api = {
  players: {
    getAll: async (): Promise<Player[]> => {
      try {
        const synced = await fetchPlayersWithSyncedStats();
        return clone(synced);
      } catch (error) {
        console.error('Failed to load players from API, falling back to initial data:', error);
        return clone(INITIAL_PLAYERS);
      }
    },
    create: async (player: Partial<Player>): Promise<Player> => {
      const created = await request<Player>('/players', {
        method: 'POST',
        body: JSON.stringify(player),
      });
      return clone(created);
    },
    update: async (id: number, patch: Partial<Player>): Promise<Player> => {
      const updated = await request<Player>(`/players/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      return clone(updated);
    },
    delete: async (id: number): Promise<void> => {
      await request<void>(`/players/${id}`, { method: 'DELETE' });
    },
  },
  trainings: {
    getAll: async (): Promise<TrainingWeek[]> => {
      try {
        const trainings = await request<TrainingWeek[]>('/trainings');
        return clone(trainings);
      } catch (error) {
        console.error('Failed to load trainings from API, falling back to initial data:', error);
        return clone(INITIAL_TRAINING_WEEKS);
      }
    },
    create: async (training: Partial<TrainingWeek>): Promise<TrainingWeek> => {
      const created = await request<TrainingWeek>('/trainings', {
        method: 'POST',
        body: JSON.stringify(training),
      });
      return clone(created);
    },
    update: async (id: number, patch: Partial<TrainingWeek>): Promise<TrainingWeek> => {
      const updated = await request<TrainingWeek>(`/trainings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      return clone(updated);
    },
  },
  matches: {
    getAll: async (): Promise<Match[]> => {
      try {
        const matches = await request<Match[]>('/matches');
        return matches.map((match) => clone(normaliseMatch(match)));
      } catch (error) {
        console.error('Failed to load matches from API, falling back to initial fixtures:', error);
        return clone(INITIAL_MATCHES);
      }
    },
    create: async (match: Partial<Match>): Promise<{ match: Match; players: Player[] }> => {
      const created = await request<Match>('/matches', {
        method: 'POST',
        body: JSON.stringify(sanitizeMatchForRequest(match)),
      });
      const syncedPlayers = await fetchPlayersWithSyncedStats();
      return { match: clone(normaliseMatch(created)), players: clone(syncedPlayers) };
    },
    update: async (id: number, match: Partial<Match>): Promise<{ match: Match; players: Player[] }> => {
      const updated = await request<Match>(`/matches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sanitizeMatchForRequest(match)),
      });
      const syncedPlayers = await fetchPlayersWithSyncedStats();
      return { match: clone(normaliseMatch(updated)), players: clone(syncedPlayers) };
    },
  },
  callups: {
    getAll: async (): Promise<CallUpRecord[]> => {
      try {
        const callups = await request<CallUpRecord[]>('/callups');
        return callups.map((callup) => clone(normaliseCallup(callup)));
      } catch (error) {
        console.error('Failed to load callups from API, falling back to initial data:', error);
        return [{ id: 1, ...clone(INITIAL_CALLUP) }];
      }
    },
    create: async (callup: CallUpData): Promise<CallUpRecord> => {
      const created = await request<CallUpRecord>('/callups', {
        method: 'POST',
        body: JSON.stringify(sanitizeCallupForRequest(callup)),
      });
      return clone(normaliseCallup(created));
    },
    update: async (id: number, callup: Partial<CallUpData>): Promise<CallUpRecord> => {
      const updated = await request<CallUpRecord>(`/callups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sanitizeCallupForRequest(callup)),
      });
      return clone(normaliseCallup(updated));
    },
  },
  formations: {
    getLatest: async (): Promise<FormationRecord | null> => {
      try {
        const latest = await request<FormationRecord | null>('/formations/latest');
        return latest ? clone(normaliseFormation(latest)) : null;
      } catch (error) {
        console.error('Failed to load formation from API, falling back to initial data:', error);
        return clone({ id: INITIAL_FORMATION.id ?? 1, ...INITIAL_FORMATION });
      }
    },
    create: async (formation: FormationData): Promise<FormationRecord> => {
      const created = await request<FormationRecord>('/formations', {
        method: 'POST',
        body: JSON.stringify(sanitizeFormationForRequest(formation)),
      });
      return clone(normaliseFormation(created));
    },
    update: async (id: number, formation: FormationData): Promise<FormationRecord> => {
      const updated = await request<FormationRecord>(`/formations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sanitizeFormationForRequest(formation)),
      });
      return clone(normaliseFormation(updated));
    },
  },
  settings: {
    get: async (): Promise<AppSettings> => {
      try {
        const settings = await request<AppSettings>('/settings');
        return clone(settings);
      } catch (error) {
        console.error('Failed to load settings from API, falling back to initial settings:', error);
        return clone(INITIAL_SETTINGS);
      }
    },
    update: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
      const updated = await request<AppSettings>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return clone(updated);
    },
  },
  utils: {
    resetAll: async () => {
      const state = await request<{
        players: Player[];
        trainings: TrainingWeek[];
        matches: Match[];
        callups: CallUpRecord[];
        callup: CallUpRecord | null;
        formation: FormationRecord | null;
        settings: AppSettings;
      }>('/utils/reset', {
        method: 'POST',
      });

      return {
        players: clone(state.players ?? []),
        trainings: clone(state.trainings ?? []),
        matches: (state.matches ?? []).map((match) => clone(normaliseMatch(match))),
        callups: (state.callups ?? []).map((callup) => clone(normaliseCallup(callup))),
        callup: state.callup ? clone(normaliseCallup(state.callup)) : null,
        formation: state.formation ? clone(normaliseFormation(state.formation)) : null,
        settings: clone(state.settings ?? INITIAL_SETTINGS),
      };
    },
  },
};
