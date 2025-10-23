import type {
  CallUpData,
  FormationData,
  Match,
  Player,
  TrainingWeek,
} from './types';
import {
  INITIAL_CALLUP as SHARED_INITIAL_CALLUP,
  INITIAL_FORMATION as SHARED_INITIAL_FORMATION,
  INITIAL_MATCHES as SHARED_INITIAL_MATCHES,
  INITIAL_PLAYERS as SHARED_INITIAL_PLAYERS,
  INITIAL_SETTINGS as SHARED_INITIAL_SETTINGS,
  INITIAL_TRAINING_WEEKS as SHARED_INITIAL_TRAINING_WEEKS,
} from '../shared/initialData';

export const INITIAL_PLAYERS: Player[] = [...SHARED_INITIAL_PLAYERS];

export const INITIAL_MATCHES: Match[] = SHARED_INITIAL_MATCHES.map(match => ({
  ...match,
  events: Array.isArray(match.events) ? [...match.events] : [],
  minutes: match.minutes ? { ...match.minutes } : {},
}));

export const INITIAL_TRAINING_WEEKS: TrainingWeek[] = SHARED_INITIAL_TRAINING_WEEKS.map(week => ({
  ...week,
  sessions: week.sessions.map(session => ({
    ...session,
    attendance: { ...session.attendance },
  })),
}));

export const INITIAL_CALLUP: CallUpData = {
  ...SHARED_INITIAL_CALLUP,
  selectedPlayers: [...SHARED_INITIAL_CALLUP.selectedPlayers],
};

export const INITIAL_FORMATION: FormationData = {
  ...SHARED_INITIAL_FORMATION,
  positions: { ...SHARED_INITIAL_FORMATION.positions },
  substitutes: SHARED_INITIAL_FORMATION.substitutes ? [...SHARED_INITIAL_FORMATION.substitutes] : [],
};

export const INITIAL_SETTINGS = { ...SHARED_INITIAL_SETTINGS };
