export type Player = {
  id: number;
  firstName: string;
  lastName: string;
  number: number;
  position:
    | 'Portiere'
    | 'Terzino Destro'
    | 'Difensore Centrale'
    | 'Terzino Sinistro'
    | 'Centrocampista Centrale'
    | 'Ala'
    | 'Attaccante';
  goals: number;
  presences: number;
  birthYear: number;
  yellowCards: number;
  redCards: number;
};

export type TeamSide = 'SEGURO' | 'AVVERSARI';

export type GoalEvent = {
  id: string;
  type: 'GOAL';
  minute: number;
  team: TeamSide;
  playerId?: number;
  note?: string;
};

export type CardEvent = {
  id: string;
  type: 'YELLOW' | 'RED';
  minute: number;
  team: TeamSide;
  playerId?: number;
  note?: string;
};

export type SubEvent = {
  id: string;
  type: 'SUB';
  minute: number;
  team: 'SEGURO';
  outId: number;
  inId: number;
  note?: string;
};

export type MatchEvent = GoalEvent | CardEvent | SubEvent;

export type Match = {
  id: number;
  round: number;
  date: string;
  time: string;
  home: string;
  away: string;
  address: string;
  city: string;
  result?: string | null;
  events: MatchEvent[];
  minutes?: Record<number, number>;
};

export type TrainingSession = {
  day: string;
  date: string;
  attendance: Record<number, boolean>;
};

export type TrainingWeek = {
  id: number;
  weekNumber: number;
  weekLabel: string;
  sessions: TrainingSession[];
};

export type CallUpData = {
  opponent: string;
  date: string;
  meetingTime: string;
  kickoffTime: string;
  location: string;
  isHome: boolean;
  selectedPlayers: number[];
};

export type CallUpRecord = CallUpData & { id: number };

export type FormationData = {
  id?: number;
  module: string;
  positions: Record<string, number | null>;
  substitutes?: (number | null)[];
};

export type FormationRecord = FormationData & { id: number };

export type AppSettings = {
  selectedWeek: number;
};
