
import React, { useMemo, useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, UserPlus, Trash2, Award, Activity, ClipboardCheck, CheckCircle, XCircle, Trophy, Target, Send, Pencil, Plus, Trash, FlagTriangleRight, RotateCcw, LogOut, UserCog, Key } from 'lucide-react';

type AuthUser = { username: string; password: string; email: string; role: 'admin' | 'user' };
type AuthData = { currentUser: AuthUser | null; users: AuthUser[] };

type Player = { id:number; firstName:string; lastName:string; number:number; position:"Portiere"|"Terzino Destro"|"Difensore Centrale"|"Terzino Sinistro"|"Centrocampista Centrale"|"Ala"|"Attaccante"; goals:number; presences:number; birthYear:number; };

type TeamSide = 'SEGURO'|'AVVERSARI';

type GoalEvent = { id:string; type:'GOAL'; minute:number; team:TeamSide; playerId?:number; note?:string };

type CardEvent = { id:string; type:'YELLOW'|'RED'; minute:number; team:TeamSide; playerId?:number; note?:string };

type SubEvent = { id:string; type:'SUB'; minute:number; team:'SEGURO'; outId:number; inId:number; note?:string };

type MatchEvent = GoalEvent | CardEvent | SubEvent;

type Match = { id:number; round:number; date:string; time:string; home:string; away:string; address:string; city:string; result?:string; events:MatchEvent[]; minutes?:Record<number,number> };

type TrainingSession = { day:string; date:string; attendance:Record<number, boolean> };

type TrainingWeek = { id:number; week:string; sessions:TrainingSession[] };

type CallUpData = { opponent:string; date:string; meetingTime:string; kickoffTime:string; location:string; selectedPlayers:number[] };

type FormationData = { module: string; positions: Record<string, number | null>; substitutes?: (number | null)[] };

const initialPlayers: Player[] = [
  { id: 1, firstName: 'Gabriele', lastName: 'Russo', number: 1, position: 'Portiere', goals: 0, presences: 12, birthYear: 2007 },
  { id: 2, firstName: 'Andrea', lastName: 'Capasso', number: 12, position: 'Portiere', goals: 0, presences: 11, birthYear: 2007 },
  { id: 3, firstName: 'Gabriele', lastName: 'Lucchini', number: 2, position: 'Terzino Destro', goals: 1, presences: 12, birthYear: 2006 },
  { id: 4, firstName: 'Davide', lastName: 'Toscano', number: 3, position: 'Terzino Destro', goals: 0, presences: 10, birthYear: 2007 },
  { id: 5, firstName: 'Giovanni', lastName: 'Montalto', number: 4, position: 'Difensore Centrale', goals: 2, presences: 11, birthYear: 2006 },
  { id: 6, firstName: 'Massimo', lastName: 'Calvone', number: 5, position: 'Difensore Centrale', goals: 1, presences: 10, birthYear: 2007 },
  { id: 7, firstName: 'Elia', lastName: 'Restivo', number: 6, position: 'Terzino Sinistro', goals: 0, presences: 12, birthYear: 2007 },
  { id: 8, firstName: 'Lorenzo', lastName: 'Dopinto', number: 8, position: 'Centrocampista Centrale', goals: 3, presences: 11, birthYear: 2006 },
  { id: 9, firstName: 'Filippo', lastName: 'Lesino', number: 7, position: 'Centrocampista Centrale', goals: 2, presences: 12, birthYear: 2007 },
  { id: 10, firstName: 'Riccardo', lastName: 'Brocca', number: 10, position: 'Centrocampista Centrale', goals: 4, presences: 11, birthYear: 2005 },
  { id: 11, firstName: 'Filippo', lastName: 'Cogliati', number: 11, position: 'Ala', goals: 5, presences: 12, birthYear: 2007 },
  { id: 12, firstName: 'Abdullah', lastName: 'Tahsif', number: 14, position: 'Ala', goals: 3, presences: 10, birthYear: 2007 },
  { id: 13, firstName: 'Afif', lastName: 'Adam', number: 15, position: 'Ala', goals: 2, presences: 11, birthYear: 2007 },
  { id: 14, firstName: 'Cristian', lastName: "D'Agostino", number: 16, position: 'Ala', goals: 4, presences: 12, birthYear: 2006 },
  { id: 15, firstName: 'Gabriele', lastName: 'Mazzei', number: 17, position: 'Ala', goals: 3, presences: 11, birthYear: 2007 },
  { id: 16, firstName: 'Andrei', lastName: 'Dorosan', number: 9, position: 'Attaccante', goals: 8, presences: 12, birthYear: 2007 },
  { id: 17, firstName: 'Gaetano', lastName: 'Cristian', number: 18, position: 'Attaccante', goals: 6, presences: 11, birthYear: 2007 },
  { id: 18, firstName: 'Domenico', lastName: 'Romito', number: 19, position: 'Attaccante', goals: 7, presences: 10, birthYear: 2007 },
  { id: 19, firstName: 'Enrico', lastName: 'Amelotti', number: 20, position: 'Attaccante', goals: 5, presences: 12, birthYear: 2007 },
];

const fixtures: Match[] = [
  { id: 1,  round: 1,  date: '2025-09-20', time: '18:00', home: 'Vighignolo', away: 'Seguro', address: 'Via Pace S.N.C.', city: 'Settimo Milanese Fr. Vighignolo', result: '4-3', events: [] },
  { id: 2,  round: 2,  date: '2025-09-27', time: '14:45', home: 'Seguro', away: 'Villapizzone', address: 'Via Sandro Pertini 13', city: 'Seguro', result: '1-1', events: [] },
  { id: 3,  round: 3,  date: '2025-10-04', time: '18:15', home: 'Sempione Half 1919', away: 'Seguro', address: 'Via Arturo Graf, 4', city: 'Milano', result: '1-1', events: [] },
  { id: 4,  round: 4,  date: '2025-10-11', time: '14:45', home: 'Seguro', away: 'Polisportiva Or. Pa. S.', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 5,  round: 5,  date: '2025-10-18', time: '17:30', home: 'Cassina Nuova', away: 'Seguro', address: 'Via Oglio, 1/3', city: 'Bollate Fraz. Cassina Nuova', events: [] },
  { id: 6,  round: 6,  date: '2025-10-25', time: '14:45', home: 'Seguro', away: 'Cob 91', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 7,  round: 7,  date: '2025-11-01', time: '17:30', home: 'Ardor Bollate', away: 'Seguro', address: 'Via Repubblica 6', city: 'Bollate', events: [] },
  { id: 8,  round: 8,  date: '2025-11-08', time: '14:45', home: 'Garibaldina 1932', away: 'Seguro', address: 'Via Don Giovanni Minzoni 4', city: 'Milano', events: [] },
  { id: 9,  round: 9,  date: '2025-11-15', time: '14:45', home: 'Seguro', away: 'Quinto Romano', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 10, round: 10, date: '2025-11-22', time: '17:45', home: 'Pro Novate', away: 'Seguro', address: 'Via V. Torlani 6', city: 'Novate Milanese', events: [] },
  { id: 11, round: 11, date: '2025-11-29', time: '14:45', home: 'Seguro', away: 'Calcio Bonola', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 12, round: 12, date: '2025-12-06', time: '18:00', home: 'Bollatese', away: 'Seguro', address: 'Via Varalli n. 2', city: 'Bollate', events: [] },
  { id: 13, round: 13, date: '2025-12-13', time: '14:45', home: 'Seguro', away: 'Vigor FC', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 14, round: 14, date: '2026-01-17', time: '14:45', home: 'Seguro', away: 'Vighignolo', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 15, round: 15, date: '2026-01-24', time: '18:15', home: 'Villapizzone', away: 'Seguro', address: 'Via Perin del Vaga 11', city: 'Milano', events: [] },
  { id: 16, round: 16, date: '2026-01-31', time: '14:45', home: 'Seguro', away: 'Sempione Half 1919', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 17, round: 17, date: '2026-02-07', time: '16:00', home: 'Polisportiva Or. Pa. S.', away: 'Seguro', address: 'Via Comasina 115', city: 'Milano', events: [] },
  { id: 18, round: 18, date: '2026-02-14', time: '14:45', home: 'Seguro', away: 'Cassina Nuova', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 19, round: 19, date: '2026-02-21', time: '18:00', home: 'Cob 91', away: 'Seguro', address: 'Via Fabio Filzi, 31', city: 'Cormano', events: [] },
  { id: 20, round: 20, date: '2026-02-28', time: '14:45', home: 'Seguro', away: 'Ardor Bollate', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 21, round: 21, date: '2026-03-07', time: '14:45', home: 'Seguro', away: 'Garibaldina 1932', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 22, round: 22, date: '2026-03-14', time: '17:00', home: 'Quinto Romano', away: 'Seguro', address: 'Via Vittorio De Sica, 14', city: 'Quinto Romano', events: [] },
  { id: 23, round: 23, date: '2026-03-21', time: '14:45', home: 'Seguro', away: 'Pro Novate', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 24, round: 24, date: '2026-03-28', time: '18:00', home: 'Calcio Bonola', away: 'Seguro', address: 'Via Fichi, 1', city: 'Milano', events: [] },
  { id: 25, round: 25, date: '2026-04-11', time: '14:45', home: 'Seguro', away: 'Bollatese', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 26, round: 26, date: '2026-04-18', time: '15:30', home: 'Vigor FC', away: 'Seguro', address: 'Via San Michele del Carso, 55', city: 'Paderno Dugnano', events: [] },
];

const itDate = (iso:string, opts?:Intl.DateTimeFormatOptions) => new Date(iso).toLocaleDateString('it-IT', opts);

// Weeks preloaded
const initialTrainings: TrainingWeek[] = [
  { id: 1, week: '01-07 September', sessions: [ { day: 'Lunedì', date: '2025-09-01', attendance: {} }, { day: 'Mercoledì', date: '2025-09-03', attendance: {} }, { day: 'Venerdì', date: '2025-09-05', attendance: {} } ] },
  { id: 2, week: '08-14 September', sessions: [ { day: 'Lunedì', date: '2025-09-08', attendance: {} }, { day: 'Mercoledì', date: '2025-09-10', attendance: {} }, { day: 'Venerdì', date: '2025-09-12', attendance: {} } ] },
  { id: 3, week: '15-21 September', sessions: [ { day: 'Lunedì', date: '2025-09-15', attendance: {} }, { day: 'Mercoledì', date: '2025-09-17', attendance: {} }, { day: 'Venerdì', date: '2025-09-19', attendance: {} } ] },
  { id: 4, week: '22-28 September', sessions: [ { day: 'Lunedì', date: '2025-09-22', attendance: {} }, { day: 'Mercoledì', date: '2025-09-24', attendance: {} }, { day: 'Venerdì', date: '2025-09-26', attendance: {} } ] },
  { id: 5, week: '29-05 September', sessions: [ { day: 'Lunedì', date: '2025-09-29', attendance: {} }, { day: 'Mercoledì', date: '2025-10-01', attendance: {} }, { day: 'Venerdì', date: '2025-10-03', attendance: {} } ] },
  { id: 6, week: '06-12 October', sessions: [ { day: 'Lunedì', date: '2025-10-06', attendance: {} }, { day: 'Mercoledì', date: '2025-10-08', attendance: {} }, { day: 'Venerdì', date: '2025-10-10', attendance: {} } ] },
  { id: 7, week: '13-19 October', sessions: [ { day: 'Lunedì', date: '2025-10-13', attendance: {} }, { day: 'Mercoledì', date: '2025-10-15', attendance: {} }, { day: 'Venerdì', date: '2025-10-17', attendance: {} } ] },
  { id: 8, week: '20-26 October', sessions: [ { day: 'Lunedì', date: '2025-10-20', attendance: {} }, { day: 'Mercoledì', date: '2025-10-22', attendance: {} }, { day: 'Venerdì', date: '2025-10-24', attendance: {} } ] },
  { id: 9, week: '27-02 October', sessions: [ { day: 'Lunedì', date: '2025-10-27', attendance: {} }, { day: 'Mercoledì', date: '2025-10-29', attendance: {} }, { day: 'Venerdì', date: '2025-10-31', attendance: {} } ] },
  { id: 10, week: '03-09 November', sessions: [ { day: 'Lunedì', date: '2025-11-03', attendance: {} }, { day: 'Mercoledì', date: '2025-11-05', attendance: {} }, { day: 'Venerdì', date: '2025-11-07', attendance: {} } ] },
  { id: 11, week: '10-16 November', sessions: [ { day: 'Lunedì', date: '2025-11-10', attendance: {} }, { day: 'Mercoledì', date: '2025-11-12', attendance: {} }, { day: 'Venerdì', date: '2025-11-14', attendance: {} } ] },
  { id: 12, week: '17-23 November', sessions: [ { day: 'Lunedì', date: '2025-11-17', attendance: {} }, { day: 'Mercoledì', date: '2025-11-19', attendance: {} }, { day: 'Venerdì', date: '2025-11-21', attendance: {} } ] },
  { id: 13, week: '24-30 November', sessions: [ { day: 'Lunedì', date: '2025-11-24', attendance: {} }, { day: 'Mercoledì', date: '2025-11-26', attendance: {} }, { day: 'Venerdì', date: '2025-11-28', attendance: {} } ] },
  { id: 14, week: '01-07 December', sessions: [ { day: 'Lunedì', date: '2025-12-01', attendance: {} }, { day: 'Mercoledì', date: '2025-12-03', attendance: {} }, { day: 'Venerdì', date: '2025-12-05', attendance: {} } ] },
  { id: 15, week: '08-14 December', sessions: [ { day: 'Lunedì', date: '2025-12-08', attendance: {} }, { day: 'Mercoledì', date: '2025-12-10', attendance: {} }, { day: 'Venerdì', date: '2025-12-12', attendance: {} } ] },
  { id: 16, week: '15-21 December', sessions: [ { day: 'Lunedì', date: '2025-12-15', attendance: {} }, { day: 'Mercoledì', date: '2025-12-17', attendance: {} }, { day: 'Venerdì', date: '2025-12-19', attendance: {} } ] },
  { id: 17, week: '22-28 December', sessions: [ { day: 'Lunedì', date: '2025-12-22', attendance: {} }, { day: 'Mercoledì', date: '2025-12-24', attendance: {} }, { day: 'Venerdì', date: '2025-12-26', attendance: {} } ] },
  { id: 18, week: '29-04 December', sessions: [ { day: 'Lunedì', date: '2025-12-29', attendance: {} }, { day: 'Mercoledì', date: '2025-12-31', attendance: {} }, { day: 'Venerdì', date: '2026-01-02', attendance: {} } ] },
  { id: 19, week: '05-11 January', sessions: [ { day: 'Lunedì', date: '2026-01-05', attendance: {} }, { day: 'Mercoledì', date: '2026-01-07', attendance: {} }, { day: 'Venerdì', date: '2026-01-09', attendance: {} } ] },
  { id: 20, week: '12-18 January', sessions: [ { day: 'Lunedì', date: '2026-01-12', attendance: {} }, { day: 'Mercoledì', date: '2026-01-14', attendance: {} }, { day: 'Venerdì', date: '2026-01-16', attendance: {} } ] },
  { id: 21, week: '19-25 January', sessions: [ { day: 'Lunedì', date: '2026-01-19', attendance: {} }, { day: 'Mercoledì', date: '2026-01-21', attendance: {} }, { day: 'Venerdì', date: '2026-01-23', attendance: {} } ] },
  { id: 22, week: '26-01 January', sessions: [ { day: 'Lunedì', date: '2026-01-26', attendance: {} }, { day: 'Mercoledì', date: '2026-01-28', attendance: {} }, { day: 'Venerdì', date: '2026-01-30', attendance: {} } ] },
  { id: 23, week: '02-08 February', sessions: [ { day: 'Lunedì', date: '2026-02-02', attendance: {} }, { day: 'Mercoledì', date: '2026-02-04', attendance: {} }, { day: 'Venerdì', date: '2026-02-06', attendance: {} } ] },
  { id: 24, week: '09-15 February', sessions: [ { day: 'Lunedì', date: '2026-02-09', attendance: {} }, { day: 'Mercoledì', date: '2026-02-11', attendance: {} }, { day: 'Venerdì', date: '2026-02-13', attendance: {} } ] },
  { id: 25, week: '16-22 February', sessions: [ { day: 'Lunedì', date: '2026-02-16', attendance: {} }, { day: 'Mercoledì', date: '2026-02-18', attendance: {} }, { day: 'Venerdì', date: '2026-02-20', attendance: {} } ] },
  { id: 26, week: '23-01 February', sessions: [ { day: 'Lunedì', date: '2026-02-23', attendance: {} }, { day: 'Mercoledì', date: '2026-02-25', attendance: {} }, { day: 'Venerdì', date: '2026-02-27', attendance: {} } ] },
  { id: 27, week: '02-08 March', sessions: [ { day: 'Lunedì', date: '2026-03-02', attendance: {} }, { day: 'Mercoledì', date: '2026-03-04', attendance: {} }, { day: 'Venerdì', date: '2026-03-06', attendance: {} } ] },
  { id: 28, week: '09-15 March', sessions: [ { day: 'Lunedì', date: '2026-03-09', attendance: {} }, { day: 'Mercoledì', date: '2026-03-11', attendance: {} }, { day: 'Venerdì', date: '2026-03-13', attendance: {} } ] },
  { id: 29, week: '16-22 March', sessions: [ { day: 'Lunedì', date: '2026-03-16', attendance: {} }, { day: 'Mercoledì', date: '2026-03-18', attendance: {} }, { day: 'Venerdì', date: '2026-03-20', attendance: {} } ] },
  { id: 30, week: '23-29 March', sessions: [ { day: 'Lunedì', date: '2026-03-23', attendance: {} }, { day: 'Mercoledì', date: '2026-03-25', attendance: {} }, { day: 'Venerdì', date: '2026-03-27', attendance: {} } ] },
  { id: 31, week: '30-05 March', sessions: [ { day: 'Lunedì', date: '2026-03-30', attendance: {} }, { day: 'Mercoledì', date: '2026-04-01', attendance: {} }, { day: 'Venerdì', date: '2026-04-03', attendance: {} } ] },
  { id: 32, week: '06-12 April', sessions: [ { day: 'Lunedì', date: '2026-04-06', attendance: {} }, { day: 'Mercoledì', date: '2026-04-08', attendance: {} }, { day: 'Venerdì', date: '2026-04-10', attendance: {} } ] },
  { id: 33, week: '13-19 April', sessions: [ { day: 'Lunedì', date: '2026-04-13', attendance: {} }, { day: 'Mercoledì', date: '2026-04-15', attendance: {} }, { day: 'Venerdì', date: '2026-04-17', attendance: {} } ] },
  { id: 34, week: '20-26 April', sessions: [ { day: 'Lunedì', date: '2026-04-20', attendance: {} }, { day: 'Mercoledì', date: '2026-04-22', attendance: {} }, { day: 'Venerdì', date: '2026-04-24', attendance: {} } ] },
  { id: 35, week: '27-03 April', sessions: [ { day: 'Lunedì', date: '2026-04-27', attendance: {} }, { day: 'Mercoledì', date: '2026-04-29', attendance: {} }, { day: 'Venerdì', date: '2026-05-01', attendance: {} } ] },
  { id: 36, week: '04-10 May', sessions: [ { day: 'Lunedì', date: '2026-05-04', attendance: {} }, { day: 'Mercoledì', date: '2026-05-06', attendance: {} }, { day: 'Venerdì', date: '2026-05-08', attendance: {} } ] },
  { id: 37, week: '11-17 May', sessions: [ { day: 'Lunedì', date: '2026-05-11', attendance: {} }, { day: 'Mercoledì', date: '2026-05-13', attendance: {} }, { day: 'Venerdì', date: '2026-05-15', attendance: {} } ] },
  { id: 38, week: '18-24 May', sessions: [ { day: 'Lunedì', date: '2026-05-18', attendance: {} }, { day: 'Mercoledì', date: '2026-05-20', attendance: {} }, { day: 'Venerdì', date: '2026-05-22', attendance: {} } ] },
  { id: 39, week: '25-31 May', sessions: [ { day: 'Lunedì', date: '2026-05-25', attendance: {} }, { day: 'Mercoledì', date: '2026-05-27', attendance: {} }, { day: 'Venerdì', date: '2026-05-29', attendance: {} } ] },
];

const initialCallUp: CallUpData = { opponent:'SEMPIONE HALF 1919', date:'2025-10-12', meetingTime:'16:45', kickoffTime:'18:15', location:'Via Antonio Aldini 77, Milano (MI)', selectedPlayers:[] };

const initialFormation: FormationData = { module: '4-3-3', positions: {}, substitutes: [null, null, null, null, null, null, null, null, null] };

const initialAuthData: AuthData = {
  currentUser: null,
  users: [
    { username: 'admin', password: 'admin2024', email: 'mattia.franchi89@gmail.com', role: 'admin' }
  ]
};

const LS_KEYS = { matches:'seguro_matches_v1', callup:'seguro_callup_v1', players:'seguro_players_v1', trainings:'seguro_trainings_v1', selectedWeek:'seguro_selectedWeek_v1', formation:'seguro_formation_v1', auth:'seguro_auth_v1' };

export default function App(){
  const [activeTab, setActiveTab] = useState<'dashboard'|'players'|'trainings'|'callup'|'matches'|'results'|'standings'|'scorers'|'admin'>('dashboard');
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [trainings, setTrainings] = useState<TrainingWeek[]>(initialTrainings);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [callUpData, setCallUpData] = useState<CallUpData>(initialCallUp);
  const [matches, setMatches] = useState<Match[]>(fixtures);
  const [openMatchId, setOpenMatchId] = useState<number|null>(null);
  const [formation, setFormation] = useState<FormationData>(initialFormation);
  const [authData, setAuthData] = useState<AuthData>(initialAuthData);

  useEffect(()=>{
    try{const r=localStorage.getItem(LS_KEYS.players); if(r) setPlayers(JSON.parse(r));}catch{}
    try{const r=localStorage.getItem(LS_KEYS.trainings); if(r) setTrainings(JSON.parse(r));}catch{}
    try{const r=localStorage.getItem(LS_KEYS.selectedWeek); if(r) setSelectedWeek(JSON.parse(r));}catch{}
    try{const r=localStorage.getItem(LS_KEYS.matches); if(r) setMatches(JSON.parse(r));}catch{}
    try{const r=localStorage.getItem(LS_KEYS.callup); if(r) setCallUpData(JSON.parse(r));}catch{}
    try{const r=localStorage.getItem(LS_KEYS.formation); if(r) setFormation(JSON.parse(r));}catch{}
    try{const r=localStorage.getItem(LS_KEYS.auth); if(r) setAuthData(JSON.parse(r));}catch{}
  },[]);
  useEffect(()=>{ try{localStorage.setItem(LS_KEYS.players, JSON.stringify(players))}catch{} },[players]);
  useEffect(()=>{ try{localStorage.setItem(LS_KEYS.trainings, JSON.stringify(trainings))}catch{} },[trainings]);
  useEffect(()=>{ try{localStorage.setItem(LS_KEYS.selectedWeek, JSON.stringify(selectedWeek))}catch{} },[selectedWeek]);
  useEffect(()=>{ try{localStorage.setItem(LS_KEYS.matches, JSON.stringify(matches))}catch{} },[matches]);
  useEffect(()=>{ try{localStorage.setItem(LS_KEYS.callup, JSON.stringify(callUpData))}catch{} },[callUpData]);
  useEffect(()=>{ try{localStorage.setItem(LS_KEYS.formation, JSON.stringify(formation))}catch{} },[formation]);
  useEffect(()=>{ try{localStorage.setItem(LS_KEYS.auth, JSON.stringify(authData))}catch{} },[authData]);

  useEffect(() => {
    const hasGoalEvents = matches.some(match => 
      match.events?.some(event => event.type === 'GOAL' && event.team === 'SEGURO')
    );
    if (!hasGoalEvents) return;
    
    const goalsByPlayer: Record<number, number> = {};
    matches.forEach(match => {
      if (match.events) {
        match.events.forEach(event => {
          if (event.type === 'GOAL' && event.team === 'SEGURO' && (event as any).playerId) {
            const playerId = (event as any).playerId;
            goalsByPlayer[playerId] = (goalsByPlayer[playerId] || 0) + 1;
          }
        });
      }
    });
    setPlayers(prev => prev.map(player => ({
      ...player,
      goals: goalsByPlayer[player.id] || 0
    })));
  }, [matches]);

  const totalGoals = useMemo(()=>players.reduce((s,p)=>s+p.goals,0),[players]);
  const playedMatches = useMemo(()=>matches.filter(m=>!!m.result).length,[matches]);

  const toggleAttendance = (playerId:number, sessionIndex:number)=>{
    setTrainings(prev=>prev.map(w=>{ if(w.id!==selectedWeek) return w; const sessions=[...w.sessions]; const s={...sessions[sessionIndex]}; s.attendance={...s.attendance,[playerId]:!s.attendance[playerId]}; sessions[sessionIndex]=s; return {...w, sessions}; }));
  };
  const addNewWeek = ()=>{ setTrainings(prev=>{ const nextId = prev.length? Math.max(...prev.map(w=>w.id))+1:1; const last = prev[prev.length-1]; const d0 = new Date(last.sessions[0].date); d0.setDate(d0.getDate()+7); const d1 = new Date(d0); d1.setDate(d0.getDate()+2); const d2 = new Date(d0); d2.setDate(d0.getDate()+4); const nw:TrainingWeek = { id: nextId, week:`Settimana ${nextId}`, sessions:[{day:'Lunedì',date:d0.toISOString().slice(0,10),attendance:{}},{day:'Mercoledì',date:d1.toISOString().slice(0,10),attendance:{}},{day:'Venerdì',date:d2.toISOString().slice(0,10),attendance:{}}]}; const arr=[...prev,nw]; setSelectedWeek(nw.id); return arr; }); };
  const getPlayerWeekStats = (playerId:number)=>{ 
    const player = players.find(p => p.id === playerId);
    if (player && isCallUpOnly(player)) return {present:0,total:0,percentage:0};
    const week=trainings.find(w=>w.id===selectedWeek); 
    if(!week) return {present:0,total:0,percentage:0}; 
    const total=week.sessions.length; 
    const absent=week.sessions.filter(s=>s.attendance[playerId]===true).length; 
    const present=total-absent; 
    const percentage= total? Math.round(present/total*100):0; 
    return {present,total,percentage}; 
  };

  const getPlayerTotalMinutes = (playerId:number) => matches.reduce((sum,m)=> sum + (m.minutes?.[playerId]||0), 0);
  
  const isCallUpOnly = (player: Player) => player.birthYear === 2009;
  
  const trainingEligiblePlayers = useMemo(() => players.filter(p => !isCallUpOnly(p)), [players]);
  
  const getPlayerAttendancePercent = (playerId:number) => { 
    const player = players.find(p => p.id === playerId);
    if (player && isCallUpOnly(player)) return 0;
    const total = trainings.reduce((acc,w)=> acc + w.sessions.length, 0); 
    if (!total) return 0; 
    const absent = trainings.reduce((acc,w)=> acc + w.sessions.filter(s=> s.attendance[playerId]===true).length, 0); 
    const present = total - absent; 
    return Math.round(present/total*100); 
  };

  const handleLogin = (username: string, password: string): boolean => {
    const user = authData.users.find(u => u.username === username && u.password === password);
    if (user) {
      setAuthData(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuthData(prev => ({ ...prev, currentUser: null }));
    setActiveTab('dashboard');
  };

  const addUser = (username: string, password: string, email: string) => {
    const newUser: AuthUser = { username, password, email, role: 'user' };
    setAuthData(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const deleteUser = (username: string) => {
    setAuthData(prev => ({ ...prev, users: prev.users.filter(u => u.username !== username) }));
  };

  const updateUserPassword = (username: string, newPassword: string) => {
    setAuthData(prev => ({
      ...prev,
      users: prev.users.map(u => u.username === username ? { ...u, password: newPassword } : u)
    }));
  };

  const resetLocalData = ()=>{ if (!confirm('Sei sicuro di voler cancellare i dati locali e tornare allo stato iniziale?')) return; try{ localStorage.removeItem(LS_KEYS.players); localStorage.removeItem(LS_KEYS.trainings); localStorage.removeItem(LS_KEYS.selectedWeek); localStorage.removeItem(LS_KEYS.matches); localStorage.removeItem(LS_KEYS.callup); localStorage.removeItem(LS_KEYS.formation);}catch{}; setPlayers(initialPlayers); setTrainings(initialTrainings); setSelectedWeek(1); setMatches(fixtures); setCallUpData(initialCallUp); setFormation(initialFormation); setOpenMatchId(null); };

  const togglePlayerCallUp = (playerId:number)=>{ setCallUpData(prev=>{ const already=prev.selectedPlayers.includes(playerId); if(already) return {...prev, selectedPlayers: prev.selectedPlayers.filter(id=>id!==playerId)}; if(prev.selectedPlayers.length>=20){alert('Puoi convocare massimo 20 giocatori!'); return prev;} const p=players.find(x=>x.id===playerId)!; const selected=prev.selectedPlayers.map(id=>players.find(x=>x.id===id)!); const oldCount=selected.filter(x=>x.birthYear===2005||x.birthYear===2006).length; if((p.birthYear===2005||p.birthYear===2006)&&oldCount>=4){alert('Puoi convocare massimo 4 giocatori nati nel 2005 o 2006!'); return prev;} return {...prev, selectedPlayers:[...prev.selectedPlayers, playerId]}; }); };
  const sendWhatsApp = ()=>{ const grouped:Record<string,Player[]>= {'Portieri':[],'Terzini Destri':[],'Difensori Centrali':[],'Terzini Sinistri':[],'Centrocampisti Centrali':[],'Ali':[],'Attaccanti':[]}; const map:Record<Player["position"],string>={'Portiere':'Portieri','Terzino Destro':'Terzini Destri','Difensore Centrale':'Difensori Centrali','Terzino Sinistro':'Terzini Sinistri','Centrocampista Centrale':'Centrocampisti Centrali','Ala':'Ali','Attaccante':'Attaccanti'}; callUpData.selectedPlayers.forEach(id=>{ const p=players.find(x=>x.id===id); if(p) grouped[map[p.position]??'Attaccanti'].push(p); }); const numberEmojis=['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','1️⃣1️⃣','1️⃣2️⃣','1️⃣3️⃣','1️⃣4️⃣','1️⃣5️⃣','1️⃣6️⃣','1️⃣7️⃣','1️⃣8️⃣','1️⃣9️⃣','2️⃣0️⃣']; let c=0; let m=`⚽⚽⚽ JUNIORES PROVINCIALE – Girone B ⚽⚽⚽
`; m+=`${callUpData.opponent} – SEGURO

`; m+=`📅 ${itDate(callUpData.date,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
`; m+=`⏰ Ritrovo: ${callUpData.meetingTime}
`; m+=`⏰ Calcio d'inizio: ${callUpData.kickoffTime}
`; m+=`📍 Campo: ${callUpData.location}

`; m+=`🗋 CONVOCATI

`; Object.entries(grouped).forEach(([role,list])=>{ if(!list.length) return; m+=`${role}
`; list.forEach(p=>{ m+=`${numberEmojis[c]} ${p.firstName} ${p.lastName}
`; c++; }); m+=`
`; }); m+=`⚠️ IMPORTANTE: Portare documento di identità! ⚠️

🎒 Occorrente:
Kit allenamento completo
Calzettoni blu`; window.open(`https://wa.me/?text=${encodeURIComponent(m)}`,'_blank'); };

  const updateMatch = (matchId:number, updater:(m:Match)=>Match)=> setMatches(prev=>prev.map(m=>m.id===matchId?updater(m):m));
  const openMatch = (id:number)=>setOpenMatchId(id);
  const closeMatch = ()=>setOpenMatchId(null);
  const selectedMatch = matches.find(m=>m.id===openMatchId)||null;

  if (!authData.currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Target className="text-blue-600"/>
          <h1 className="text-xl font-bold">Seguro Calcio U19</h1>
          <span className="ml-auto text-sm text-gray-500">{authData.currentUser.email}</span>
          <button className="ml-3 btn" onClick={resetLocalData}><RotateCcw size={16}/> Reset dati</button>
          <button className="btn btn-ghost" onClick={handleLogout}><LogOut size={16}/> Esci</button>
        </div>
        <nav className="max-w-6xl mx-auto px-2 pb-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2">
          <TabButton active={activeTab==='dashboard'} onClick={()=>setActiveTab('dashboard')} icon={<TrendingUp size={18}/>}>Dashboard</TabButton>
          <TabButton active={activeTab==='players'} onClick={()=>setActiveTab('players')} icon={<Users size={18}/>}>Giocatori</TabButton>
          <TabButton active={activeTab==='trainings'} onClick={()=>setActiveTab('trainings')} icon={<ClipboardCheck size={18}/>}>Allenamenti</TabButton>
          <TabButton active={activeTab==='callup'} onClick={()=>setActiveTab('callup')} icon={<UserPlus size={18}/>}>Convocazione</TabButton>
          <TabButton active={activeTab==='matches'} onClick={()=>setActiveTab('matches')} icon={<Calendar size={18}/>}>Partite</TabButton>
          <TabButton active={activeTab==='results'} onClick={()=>setActiveTab('results')} icon={<Activity size={18}/>}>Risultati</TabButton>
          <TabButton active={activeTab==='standings'} onClick={()=>setActiveTab('standings')} icon={<Trophy size={18}/>}>Classifica</TabButton>
          <TabButton active={activeTab==='scorers'} onClick={()=>setActiveTab('scorers')} icon={<Award size={18}/>}>Marcatori</TabButton>
          {authData.currentUser.role === 'admin' && <TabButton active={activeTab==='admin'} onClick={()=>setActiveTab('admin')} icon={<UserCog size={18}/>}>Admin</TabButton>}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab==='dashboard' && <Dashboard totalPlayers={players.length} totalMatches={playedMatches} totalGoals={totalGoals} players={players}/>}
        {activeTab==='players' && <PlayersTab players={players} setPlayers={setPlayers} getPlayerTotalMinutes={getPlayerTotalMinutes} getPlayerAttendancePercent={getPlayerAttendancePercent}/>}
        {activeTab==='trainings' && (
          <TrainingsTab players={trainingEligiblePlayers} trainings={trainings} selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} toggleAttendance={toggleAttendance} addNewWeek={addNewWeek} getPlayerWeekStats={getPlayerWeekStats}/>
        )}
        {activeTab==='callup' && (
          <CallUpTab players={players} matches={matches} callUpData={callUpData} setCallUpData={setCallUpData} togglePlayerCallUp={togglePlayerCallUp} sendWhatsApp={sendWhatsApp} getPlayerWeekStats={getPlayerWeekStats} formation={formation} setFormation={setFormation}/>
        )}
        {activeTab==='scorers' && (
          <div className="card"><h2 className="text-lg font-semibold mb-3">Marcatori</h2><div className="flex justify-center"><iframe src="https://www.tuttocampo.it/WidgetV2/Marcatori/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="700" scrolling="no" loading="lazy" frameBorder={0} style={{border:0,width:'100%',maxWidth:500}}/></div></div>
        )}
        {activeTab==='matches' && <MatchesTab matches={matches} onOpen={openMatch}/>}
        {activeTab==='results' && (
          <div className="card"><h2 className="text-lg font-semibold mb-3">Risultati</h2><div className="flex justify-center"><iframe src="https://www.tuttocampo.it/WidgetV2/Risultati/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="600" scrolling="no" loading="lazy" frameBorder={0} style={{border:0,width:'100%',maxWidth:500}}/></div></div>
        )}
        {activeTab==='standings' && (
          <div className="card"><h2 className="text-lg font-semibold mb-3">Classifica</h2><div className="flex justify-center"><iframe src="https://www.tuttocampo.it/WidgetV2/Classifica/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="600" scrolling="no" loading="lazy" frameBorder={0} style={{border:0,width:'100%',maxWidth:500}}/></div></div>
        )}
        {activeTab==='admin' && authData.currentUser.role === 'admin' && <AdminPanel users={authData.users} addUser={addUser} deleteUser={deleteUser} updateUserPassword={updateUserPassword} />}
      </main>

      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} players={players} onClose={closeMatch} onSave={(updater)=>updateMatch(selectedMatch.id, updater)}/>
      )}
    </div>
  );
}

function TabButton({active,onClick,children,icon}:{active:boolean; onClick:()=>void; children:React.ReactNode; icon:React.ReactNode}){return <button onClick={onClick} className={`btn ${active?'bg-blue-600 text-white':'btn-ghost'} justify-center`}>{icon}{children}</button>;}

function Dashboard({totalPlayers,totalMatches,totalGoals,players}:{totalPlayers:number; totalMatches:number; totalGoals:number; players:Player[]}){
  const topScorers=[...players].sort((a,b)=>b.goals-a.goals).slice(0,5); const nextMatchDate='19 Ott';
  return (<>
    <section className="grid sm:grid-cols-3 gap-4">
      <div className="card flex items-center justify-between"><div><p className="text-sm text-gray-500">Giocatori</p><p className="text-2xl font-bold">{totalPlayers}</p></div><Users className="text-blue-600"/></div>
      <div className="card flex items-center justify-between"><div><p className="text-sm text-gray-500">Partite Giocate</p><p className="text-2xl font-bold">{totalMatches}</p></div><Calendar className="text-blue-600"/></div>
      <div className="card flex items-center justify-between"><div><p className="text-sm text-gray-500">Gol Totali</p><p className="text-2xl font-bold">{totalGoals}</p></div><Award className="text-blue-600"/></div>
    </section>
    <section className="card"><h2 className="text-lg font-semibold mb-3">Top Marcatori</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{topScorers.map((p,idx)=>(<div key={p.id} className="flex items-center justify-between bg-gray-50 rounded p-3"><div><div className="text-sm text-gray-500">#{idx+1}</div><div className="font-semibold">{p.firstName} {p.lastName}</div><div className="text-sm text-gray-500">{p.position}</div></div><div className="text-right"><div className="text-2xl font-bold">{p.goals}</div><div className="text-xs text-gray-500">gol</div></div></div>))}</div><div className="mt-4 text-sm text-gray-600">Prossima Partita: <b>{nextMatchDate}</b></div></section>
  </>);
}

function PlayersTab({players,setPlayers,getPlayerTotalMinutes,getPlayerAttendancePercent}:{players:Player[]; setPlayers:React.Dispatch<React.SetStateAction<Player[]>>; getPlayerTotalMinutes:(id:number)=>number; getPlayerAttendancePercent:(id:number)=>number}){
  const [showAdd,setShowAdd]=useState(false); const [form,setForm]=useState<Partial<Player>>({position:'Attaccante',birthYear:2007});
  const addPlayer=()=>{ if(!form.firstName||!form.lastName||!form.number) return; setPlayers(prev=>[...prev,{ id: prev.length? Math.max(...prev.map(p=>p.id))+1:1, firstName:form.firstName!, lastName:form.lastName!, number:Number(form.number), position:(form.position??'Attaccante') as Player['position'], goals:0, presences:0, birthYear:Number(form.birthYear??2007) }]); setForm({position:'Attaccante',birthYear:2007}); setShowAdd(false); };
  const deletePlayer=(id:number)=> setPlayers(prev=>prev.filter(p=>p.id!==id));
  
  const regularPlayers = players.filter(p => p.birthYear !== 2009);
  const callUpOnlyPlayers = players.filter(p => p.birthYear === 2009);
  
  return (<section className="space-y-6">
    <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Rosa Giocatori</h2><button className="btn btn-primary" onClick={()=>setShowAdd(s=>!s)}><UserPlus size={18}/>Aggiungi Giocatore</button></div>
    {showAdd && (<div className="card grid sm:grid-cols-5 gap-3">
      <div><label className="text-sm text-gray-600">Nome</label><input className="w-full border rounded-lg px-3 py-2" value={form.firstName??''} onChange={e=>setForm(f=>({...f, firstName:e.target.value}))}/></div>
      <div><label className="text-sm text-gray-600">Cognome</label><input className="w-full border rounded-lg px-3 py-2" value={form.lastName??''} onChange={e=>setForm(f=>({...f, lastName:e.target.value}))}/></div>
      <div><label className="text-sm text-gray-600">Numero</label><input className="w-full border rounded-lg px-3 py-2" value={form.number??''} onChange={e=>setForm(f=>({...f, number:e.target.value as any}))}/></div>
      <div><label className="text-sm text-gray-600">Ruolo</label><select className="w-full border rounded-lg px-3 py-2" value={form.position} onChange={e=>setForm(f=>({...f, position:e.target.value as any}))}><option>Portiere</option><option>Terzino Destro</option><option>Difensore Centrale</option><option>Terzino Sinistro</option><option>Centrocampista Centrale</option><option>Ala</option><option>Attaccante</option></select></div>
      <div><label className="text-sm text-gray-600">Anno</label><input className="w-full border rounded-lg px-3 py-2" value={form.birthYear??2007} onChange={e=>setForm(f=>({...f, birthYear:Number(e.target.value)}))}/></div>
      <div className="sm:col-span-5"><button className="btn btn-primary" onClick={addPlayer}>Conferma</button></div>
    </div>)}
    
    <div>
      <h3 className="text-md font-semibold mb-3">🔵 Giocatori Regolari</h3>
      <div className="card overflow-auto"><table className="table w-full min-w-[820px]"><thead><tr className="text-left text-sm text-gray-500"><th>N°</th><th>Nome</th><th>Cognome</th><th>Ruolo</th><th>Anno</th><th>Gol</th><th>Minuti</th><th>% Allen.</th><th>Azioni</th></tr></thead><tbody>{[...regularPlayers].sort((a,b)=>a.number-b.number).map(p=>(<tr key={p.id} className="border-t"><td>{p.number}</td><td className="font-medium">{p.firstName}</td><td className="font-medium">{p.lastName}</td><td>{p.position}</td><td><span className={`badge ${p.birthYear<=2006?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>{p.birthYear}</span></td><td>{p.goals}</td><td>{getPlayerTotalMinutes(p.id)}</td><td>{getPlayerAttendancePercent(p.id)}%</td><td><button className="text-red-600 hover:text-red-800" onClick={()=>deletePlayer(p.id)} title="Elimina"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
    </div>
    
    <div>
      <h3 className="text-md font-semibold mb-3">🟣 Giocatori Convocabili (2009)</h3>
      <div className="card overflow-auto"><table className="table w-full min-w-[820px]"><thead><tr className="text-left text-sm text-gray-500"><th>N°</th><th>Nome</th><th>Cognome</th><th>Ruolo</th><th>Anno</th><th>Gol</th><th>Minuti</th><th>Azioni</th></tr></thead><tbody>{callUpOnlyPlayers.length===0?(<tr><td colSpan={8} className="text-center text-gray-500 py-4">Nessun giocatore convocabile</td></tr>):([...callUpOnlyPlayers].sort((a,b)=>a.number-b.number).map(p=>(<tr key={p.id} className="border-t"><td>{p.number}</td><td className="font-medium">{p.firstName}</td><td className="font-medium">{p.lastName}</td><td>{p.position}</td><td><span className="badge bg-purple-100 text-purple-700">{p.birthYear}</span></td><td>{p.goals}</td><td>{getPlayerTotalMinutes(p.id)}</td><td><button className="text-red-600 hover:text-red-800" onClick={()=>deletePlayer(p.id)} title="Elimina"><Trash2 size={18}/></button></td></tr>)))}</tbody></table></div>
    </div>
  </section>);
}

function TrainingsTab({ players, trainings, selectedWeek, setSelectedWeek, toggleAttendance, addNewWeek, getPlayerWeekStats }:{ players:Player[]; trainings:TrainingWeek[]; selectedWeek:number; setSelectedWeek:(n:number)=>void; toggleAttendance:(playerId:number,sessionIndex:number)=>void; addNewWeek:()=>void; getPlayerWeekStats:(playerId:number)=>{present:number; total:number; percentage:number} }){
  const week = trainings.find(w=>w.id===selectedWeek);
  
  const closeTraining = (sessionIndex: number) => {
    if (confirm('Chiudere questo allenamento? Tutti i giocatori non selezionati saranno marcati come presenti.')) {
      return;
    }
  };
  
  return (<section className="space-y-4">
    <div className="flex items-center gap-3">
      <h2 className="text-lg font-semibold">Presenze Allenamenti</h2>
      <button className="btn btn-primary" onClick={addNewWeek}>Nuova Settimana</button>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-gray-600">Seleziona Settimana</span>
        <select className="px-3 py-2 border rounded-lg" value={selectedWeek} onChange={e=>setSelectedWeek(Number(e.target.value))}>
          {trainings.map(t=> <option key={t.id} value={t.id}>{t.week}</option>) }
        </select>
      </div>
    </div>

    {week && week.sessions.map((s,idx)=>(
      <div key={idx} className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">{s.day}</h3>
            <div className="text-sm text-gray-600">{itDate(s.date,{day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
          <button className="btn btn-ghost text-blue-600" onClick={() => closeTraining(idx)}>
            <CheckCircle size={18} /> Chiudi Allenamento
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">👇 Seleziona solo i giocatori <strong>ASSENTI</strong></p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {players.map(pl=>{ const absent = s.attendance[pl.id]===true; return (
            <button key={pl.id} onClick={()=>toggleAttendance(pl.id,idx)} className={`p-3 rounded-lg border-2 text-left transition ${absent?'bg-red-50 border-red-400 hover:bg-red-100':'bg-green-50 border-green-400 hover:bg-green-100'}`}>
              <div className="flex items-center gap-2">{absent?<XCircle className="text-red-600"/>:<CheckCircle className="text-green-600"/>}<span className="text-sm text-gray-500">N° {pl.number}</span></div>
              <div className="font-medium">{pl.firstName} {pl.lastName}</div>
            </button>
          );})}
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="text-green-700"><b>{players.length - Object.values(s.attendance).filter(a=>a===true).length}</b> Presenti</div>
          <div className="text-red-700"><b>{Object.values(s.attendance).filter(a=>a===true).length}</b> Assenti</div>
          <div><b>{Math.round(((players.length - Object.values(s.attendance).filter(a=>a===true).length)/players.length)*100)||0}%</b> Percentuale Presenze</div>
        </div>
      </div>
    ))}

    <div className="card">
      <h3 className="font-semibold mb-2">📈 Statistiche Settimana</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {players.map(pl=>{ const st=getPlayerWeekStats(pl.id); return <div key={pl.id} className="bg-gray-50 rounded p-3"><div className="font-medium">{pl.firstName} {pl.lastName} <span className="text-xs text-gray-500">N° {pl.number}</span></div><div className="text-sm text-gray-600">{st.present}/{st.total} — {st.percentage}%</div></div>; })}
      </div>
    </div>
  </section>);
}

function CallUpTab({ players, matches, callUpData, setCallUpData, togglePlayerCallUp, sendWhatsApp, getPlayerWeekStats, formation, setFormation }:{ players:Player[]; matches:Match[]; callUpData:CallUpData; setCallUpData:React.Dispatch<React.SetStateAction<CallUpData>>; togglePlayerCallUp:(id:number)=>void; sendWhatsApp:()=>void; getPlayerWeekStats:(playerId:number)=>{present:number; total:number; percentage:number}; formation:FormationData; setFormation:React.Dispatch<React.SetStateAction<FormationData>> }){
  const oldPlayers = callUpData.selectedPlayers.map(id=>players.find(p=>p.id===id)!).filter(p=>p && (p.birthYear===2005||p.birthYear===2006));
  
  const handleMatchChange = (matchId: string) => {
    if (!matchId) {
      setCallUpData(v=>({...v, opponent: '', date: '', meetingTime: '', kickoffTime: '', location: ''}));
      return;
    }
    
    const match = matches.find(m => m.id === Number(matchId));
    
    if (match) {
      const isHome = match.home === 'Seguro';
      const opponent = isHome ? match.away : match.home;
      const matchDate = new Date(`${match.date}T${match.time}`);
      const meetingDate = new Date(matchDate);
      
      meetingDate.setMinutes(meetingDate.getMinutes() - 90);
      
      const meetingTime = meetingDate.toTimeString().slice(0, 5);
      const location = `${match.address}, ${match.city}`;
      
      setCallUpData(v=>({
        ...v,
        opponent: opponent.toUpperCase(),
        date: match.date,
        meetingTime: meetingTime,
        kickoffTime: match.time,
        location: location
      }));
    }
  };
  
  const matchOptions = matches.map(m => {
    const isHome = m.home === 'Seguro';
    const opponent = isHome ? m.away : m.home;
    const venue = isHome ? 'Casa' : 'Trasferta';
    const dateFormatted = itDate(m.date, {day: '2-digit', month: '2-digit'});
    return {
      id: m.id,
      label: `${opponent} - ${dateFormatted} (${venue})`,
      opponent: opponent.toUpperCase(),
      date: m.date
    };
  });
  
  const currentSelection = matchOptions.find(opt => 
    opt.opponent === callUpData.opponent && opt.date === callUpData.date
  );
  
  return (<section className="space-y-4">
    <div className="card grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div><label className="text-sm text-gray-600">Partita</label><select className="w-full px-3 py-2 border rounded-lg" value={currentSelection?.id || ''} onChange={e=>handleMatchChange(e.target.value)}><option value="">-- Seleziona Partita --</option>{matchOptions.map(opt=><option key={opt.id} value={opt.id}>{opt.label}</option>)}</select></div>
      <div><label className="text-sm text-gray-600">Data Partita</label><input type="date" className="w-full px-3 py-2 border rounded-lg" value={callUpData.date} onChange={e=>setCallUpData(v=>({...v,date:e.target.value}))}/></div>
      <div><label className="text-sm text-gray-600">Orario Ritrovo</label><input type="time" className="w-full px-3 py-2 border rounded-lg" value={callUpData.meetingTime} onChange={e=>setCallUpData(v=>({...v,meetingTime:e.target.value}))}/></div>
      <div><label className="text-sm text-gray-600">Calcio d'Inizio</label><input type="time" className="w-full px-3 py-2 border rounded-lg" value={callUpData.kickoffTime} onChange={e=>setCallUpData(v=>({...v,kickoffTime:e.target.value}))}/></div>
      <div className="lg:col-span-2"><label className="text-sm text-gray-600">Indirizzo Campo</label><input className="w-full px-3 py-2 border rounded-lg" value={callUpData.location} onChange={e=>setCallUpData(v=>({...v,location:e.target.value}))}/></div>
      <div className="flex items-center gap-3"><span className="badge bg-blue-100 text-blue-700">{callUpData.selectedPlayers.length}/20 Selezionati</span><span className="badge bg-orange-100 text-orange-700">{oldPlayers.length}/4 2005-2006</span></div>
      <div className="lg:col-span-3"><button className="btn btn-primary" onClick={sendWhatsApp}><Send size={18}/>Invia su WhatsApp</button></div>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {players.map(p=>{ const isSel=callUpData.selectedPlayers.includes(p.id); const st=getPlayerWeekStats(p.id); return (
        <button key={p.id} onClick={()=>togglePlayerCallUp(p.id)} className={`p-4 rounded-lg border-2 text-left transition ${isSel?'bg-blue-50 border-blue-500':'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}>
          <div className="flex items-center justify-between"><span className="text-sm text-gray-500">N° {p.number}</span><span className={`badge ${p.birthYear<=2006?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-700'}`}>{p.birthYear}</span></div>
          <div className="font-semibold">{p.firstName} {p.lastName}</div>
          <div className="text-sm text-gray-600">{p.position}</div>
          <div className="text-xs text-gray-500 mt-1">Presenze settimana: {st.present}/{st.total} ({st.percentage}%)</div>
          {isSel && <div className="mt-2 text-blue-600 text-sm font-medium">Selezionato</div>}
        </button>
      );})}
    </div>
    
    <FormationBuilder players={players} formation={formation} setFormation={setFormation} />
  </section>);
}

function MatchesTab({matches,onOpen}:{matches:Match[]; onOpen:(id:number)=>void}){
  return (<section className="space-y-3">
    <h2 className="text-lg font-semibold">Partite</h2>
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="card"><h3 className="font-semibold mb-2">Ultima Partita</h3><div className="flex justify-center"><iframe src="https://www.tuttocampo.it/WidgetV2/Partita/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="350" scrolling="no" loading="lazy" frameBorder={0} style={{border:0,width:'100%',maxWidth:500}}/></div></div>
      <div className="card"><h3 className="font-semibold mb-2">Prossima Partita</h3><div className="flex justify-center"><iframe src="https://www.tuttocampo.it/WidgetV2/ProssimaPartita/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="350" scrolling="no" loading="lazy" frameBorder={0} style={{border:0,width:'100%',maxWidth:500}}/></div></div>
    </div>
    <h2 className="text-lg font-semibold mt-2">Calendario Partite</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {matches.map(m=> (
        <div key={m.id} className="card">
          <div className="text-xs text-gray-500">Giornata {m.round} • {itDate(m.date)} • {m.time}</div>
          <h3 className="font-semibold mt-1">{m.home} vs {m.away}</h3>
          <div className="mt-1 text-sm text-gray-600">{m.address} — {m.city}</div>
          <div className="mt-2 flex items-center justify-between">
            <div>{m.result ? <span className="text-green-700 font-semibold">{m.result}</span> : <span className="text-gray-500">Da giocare</span>}</div>
            <button className="btn btn-primary" onClick={()=>onOpen(m.id)}><Pencil size={16}/> Dettagli</button>
          </div>
        </div>
      ))}
    </div>
  </section>);
}

function MatchDetailModal({match,players,onClose,onSave}:{match:Match; players:Player[]; onClose:()=>void; onSave:(updater:(m:Match)=>Match)=>void}){
  const [local,setLocal] = useState<Match>({...match, minutes: match.minutes || {} });
  const addGoal=(side:TeamSide)=> setLocal(m=>({...m, events:[...m.events, {id:crypto.randomUUID?.()||String(Date.now()), type:'GOAL', minute:0, team:side} as GoalEvent]}));
  const addCard=(k:'YELLOW'|'RED', side:TeamSide)=> setLocal(m=>({...m, events:[...m.events, {id:crypto.randomUUID?.()||String(Date.now()), type:k, minute:0, team:side} as CardEvent]}));
  const addSub=()=>{ const a=players[0]?.id??1, b=players[1]?.id??2; setLocal(m=>({...m, events:[...m.events, {id:crypto.randomUUID?.()||String(Date.now()), type:'SUB', minute:0, team:'SEGURO', outId:a, inId:b} as SubEvent]})); };
  const updateEvent=(id:string, patch:Partial<MatchEvent>)=> setLocal(m=>({...m, events:m.events.map(ev=>ev.id===id?({...ev,...patch} as MatchEvent):ev)}));
  const removeEvent=(id:string)=> setLocal(m=>({...m, events:m.events.filter(ev=>ev.id!==id)}));

  // Calcola minuti
  const [calcDuration, setCalcDuration] = useState<number>(90);
  const [starters, setStarters] = useState<number[]>([]);
  const toggleStarter = (id:number) => setStarters(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const calcMinutes = () => {
    const D = Math.max(0, Number(calcDuration)||90);
    const subs = [...local.events].filter(e=> (e as any).type==='SUB' && (e as any).team==='SEGURO').sort((a:any,b:any)=> (a.minute||0)-(b.minute||0)) as any[];
    const on = new Set<number>(starters);
    const startAt = new Map<number, number>();
    const mins: Record<number, number> = { ...(local.minutes||{}) };
    on.forEach(pid => { startAt.set(pid, 0); mins[pid] = mins[pid] || 0; });
    for (const ev of subs) {
      const m = Math.min(D, Math.max(0, Number((ev as any).minute)||0));
      const outId = (ev as any).outId as number;
      const inId = (ev as any).inId as number;
      if (on.has(outId)) { const st = startAt.get(outId) ?? 0; mins[outId] = (mins[outId]||0) + Math.max(0, m - st); on.delete(outId); startAt.delete(outId); }
      if (!on.has(inId)) { on.add(inId); startAt.set(inId, m); mins[inId] = mins[inId] || 0; }
    }
    on.forEach(pid => { const st = startAt.get(pid) ?? 0; mins[pid] = (mins[pid]||0) + Math.max(0, D - st); });
    setLocal(m=>({ ...m, minutes: mins }));
    alert('Minuti calcolati e applicati. Premi SALVA per confermare la partita.');
  };

  const save=()=>{ onSave(()=>local); onClose(); };

  return (<div className="fixed inset-0 z-20 bg-black/50 flex items-end sm:items-center justify-center p-2">
    <div className="bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b flex items-center gap-2"><FlagTriangleRight className="text-blue-600"/><div className="font-semibold">Giornata {local.round} — {local.home} vs {local.away}</div><button className="ml-auto text-gray-500 hover:text-gray-800" onClick={onClose}>✕</button></div>
      <div className="p-4 space-y-4 max-h-[80vh] overflow-auto">
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className="text-sm text-gray-600">Data</label><input type="date" className="w-full border rounded-lg px-3 py-2" value={local.date} onChange={e=>setLocal(v=>({...v,date:e.target.value}))}/></div>
          <div><label className="text-sm text-gray-600">Ora</label><input type="time" className="w-full border rounded-lg px-3 py-2" value={local.time} onChange={e=>setLocal(v=>({...v,time:e.target.value}))}/></div>
          <div><label className="text-sm text-gray-600">Risultato</label><input placeholder="es. 1-1" className="w-full border rounded-lg px-3 py-2" value={local.result??''} onChange={e=>setLocal(v=>({...v,result:e.target.value||undefined}))}/></div>
          <div className="sm:col-span-3"><label className="text-sm text-gray-600">Campo</label><input className="w-full border rounded-lg px-3 py-2" value={local.address} onChange={e=>setLocal(v=>({...v,address:e.target.value}))}/><input className="w-full border rounded-lg px-3 py-2 mt-2" value={local.city} onChange={e=>setLocal(v=>({...v,city:e.target.value}))}/></div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={()=>addGoal('SEGURO')}><Plus size={16}/> Goal Seguro</button>
          <button className="btn btn-primary" onClick={()=>addGoal('AVVERSARI')}><Plus size={16}/> Goal Avversari</button>
          <button className="btn btn-primary" onClick={()=>addCard('YELLOW','SEGURO')}><Plus size={16}/> Ammonizione Seguro</button>
          <button className="btn btn-primary" onClick={()=>addCard('RED','SEGURO')}><Plus size={16}/> Espulsione Seguro</button>
          <button className="btn btn-primary" onClick={addSub}><Plus size={16}/> Sostituzione</button>
        </div>
        <div className="card"><h3 className="font-semibold mb-2">Eventi</h3>{local.events.length===0 && <div className="text-sm text-gray-600">Nessun evento aggiunto.</div>}<div className="space-y-2">{local.events.map(ev=> (<div key={ev.id} className="border rounded-lg p-3"><div className="flex items-center gap-2 text-sm mb-2"><span className={`badge ${ev.type==='GOAL'?'bg-green-100 text-green-700': ev.type==='SUB'?'bg-blue-100 text-blue-700': ev.type==='YELLOW'?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-700'}`}>{labelForEvent(ev)}</span><span className="text-gray-500">{ev.team}</span></div><EventEditor ev={ev} players={players} onChange={(patch)=>updateEvent(ev.id, patch)} onRemove={()=>removeEvent(ev.id)}/></div>))}</div></div>
        <div className="card">
          <h3 className="font-semibold mb-2">Calcola minuti</h3>
          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm text-gray-600">Durata gara (min)</label>
              <input type="number" min={1} max={150} className="w-full border rounded-lg px-3 py-2" value={calcDuration}
                     onChange={e=>setCalcDuration(Number(e.target.value)||90)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600">Titolari (seleziona XI iniziale)</label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
                {players.map(p=> (
                  <label key={p.id} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${starters.includes(p.id)?'bg-blue-50 border-blue-400':'bg-gray-50 border-gray-300'}`}>
                    <input type="checkbox" checked={starters.includes(p.id)} onChange={()=>toggleStarter(p.id)} />
                    <span className="text-sm">{p.number} — {p.firstName} {p.lastName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-3">
              <button className="btn btn-primary" onClick={calcMinutes}><Plus size={16}/> Calcola e applica</button>
              <span className="text-sm text-gray-500 ml-2">Usa gli eventi di <b>Sostituzione</b> per stimare il minutaggio.</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Minuti giocati (opzionale)</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <label className="w-36 text-sm text-gray-700">{p.number} — {p.firstName} {p.lastName}</label>
                <input type="number" min={0} max={130} className="w-24 border rounded-lg px-2 py-1"
                  value={local.minutes?.[p.id] ?? ''}
                  onChange={e => {
                    const v = (e.target as HTMLInputElement).value === '' ? undefined : Number((e.target as HTMLInputElement).value);
                    setLocal(m => ({...m, minutes: {...(m.minutes||{}), [p.id]: (v as any)}}));
                  }}
                  placeholder="min" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-end gap-2"><button className="btn btn-ghost" onClick={onClose}>Annulla</button><button className="btn btn-primary" onClick={save}>Salva</button></div>
    </div>
  </div>);
}

function labelForEvent(ev:MatchEvent){ switch(ev.type){ case 'GOAL': return 'Goal'; case 'YELLOW': return 'Ammonizione'; case 'RED': return 'Espulsione'; case 'SUB': return 'Sostituzione'; } }

function EventEditor({ev,players,onChange,onRemove}:{ev:MatchEvent; players:Player[]; onChange:(patch:Partial<MatchEvent>)=>void; onRemove:()=>void}){
  return (<div className="grid sm:grid-cols-4 gap-2 items-end">
    <div><label className="text-sm text-gray-600">Min.</label><input type="number" min={0} max={130} className="w-full border rounded-lg px-3 py-2" value={(ev as any).minute??0} onChange={e=>onChange({minute:Number((e.target as HTMLInputElement).value)} as any)}/></div>
    {ev.type==='GOAL' && (<><div><label className="text-sm text-gray-600">Squadra</label><select className="w-full border rounded-lg px-3 py-2" value={ev.team} onChange={e=>onChange({team:(e.target as HTMLSelectElement).value as any})}><option value="SEGURO">SEGURO</option><option value="AVVERSARI">AVVERSARI</option></select></div><div><label className="text-sm text-gray-600">Giocatore (facolt.)</label><select className="w-full border rounded-lg px-3 py-2" value={(ev as any).playerId??''} onChange={e=>onChange({playerId:(e.target as HTMLSelectElement).value?Number((e.target as HTMLSelectElement).value):undefined} as any)}><option value="">—</option>{players.map(p=> <option key={p.id} value={p.id}>{p.number} — {p.firstName} {p.lastName}</option>)}</select></div><div><label className="text-sm text-gray-600">Note</label><input className="w-full border rounded-lg px-3 py-2" value={(ev as any).note??''} onChange={e=>onChange({note:(e.target as HTMLInputElement).value} as any)}/></div></>)}
    {(ev.type==='YELLOW'||ev.type==='RED') && (<><div><label className="text-sm text-gray-600">Squadra</label><select className="w-full border rounded-lg px-3 py-2" value={ev.team} onChange={e=>onChange({team:(e.target as HTMLSelectElement).value as any})}><option value="SEGURO">SEGURO</option><option value="AVVERSARI">AVVERSARI</option></select></div><div><label className="text-sm text-gray-600">Giocatore (facolt.)</label><select className="w-full border rounded-lg px-3 py-2" value={(ev as any).playerId??''} onChange={e=>onChange({playerId:(e.target as HTMLSelectElement).value?Number((e.target as HTMLSelectElement).value):undefined} as any)}><option value="">—</option>{players.map(p=> <option key={p.id} value={p.id}>{p.number} — {p.firstName} {p.lastName}</option>)}</select></div><div><label className="text-sm text-gray-600">Note</label><input className="w-full border rounded-lg px-3 py-2" value={(ev as any).note??''} onChange={e=>onChange({note:(e.target as HTMLInputElement).value} as any)}/></div></>)}
    {ev.type==='SUB' && (<><div><label className="text-sm text-gray-600">Esce</label><select className="w-full border rounded-lg px-3 py-2" value={(ev as any).outId} onChange={e=>onChange({outId:Number((e.target as HTMLSelectElement).value)} as any)}>{players.map(p=> <option key={p.id} value={p.id}>{p.number} — {p.firstName} {p.lastName}</option>)}</select></div><div><label className="text-sm text-gray-600">Entra</label><select className="w-full border rounded-lg px-3 py-2" value={(ev as any).inId} onChange={e=>onChange({inId:Number((e.target as HTMLSelectElement).value)} as any)}>{players.map(p=> <option key={p.id} value={p.id}>{p.number} — {p.firstName} {p.lastName}</option>)}</select></div><div><label className="text-sm text-gray-600">Note</label><input className="w-full border rounded-lg px-3 py-2" value={(ev as any).note??''} onChange={e=>onChange({note:(e.target as HTMLInputElement).value} as any)}/></div></>)}
    <div className="sm:col-span-4 flex justify-end"><button className="text-red-600 hover:text-red-800 inline-flex items-center gap-1" onClick={onRemove}><Trash size={16}/> Rimuovi</button></div>
  </div>);
}

const formations: Record<string, {x:number; y:number; label:string}[]> = {
  '4-3-3': [
    {x:50,y:90,label:'P'}, 
    {x:15,y:70,label:'TD'},{x:35,y:75,label:'DC'},{x:65,y:75,label:'DC'},{x:85,y:70,label:'TS'},
    {x:30,y:50,label:'CC'},{x:50,y:55,label:'CC'},{x:70,y:50,label:'CC'},
    {x:20,y:25,label:'A'},{x:50,y:20,label:'A'},{x:80,y:25,label:'A'}
  ],
  '4-4-2': [
    {x:50,y:90,label:'P'},
    {x:15,y:70,label:'TD'},{x:35,y:75,label:'DC'},{x:65,y:75,label:'DC'},{x:85,y:70,label:'TS'},
    {x:15,y:45,label:'E'},{x:35,y:50,label:'CC'},{x:65,y:50,label:'CC'},{x:85,y:45,label:'E'},
    {x:35,y:20,label:'A'},{x:65,y:20,label:'A'}
  ],
  '4-2-3-1': [
    {x:50,y:90,label:'P'},
    {x:15,y:70,label:'TD'},{x:35,y:75,label:'DC'},{x:65,y:75,label:'DC'},{x:85,y:70,label:'TS'},
    {x:35,y:55,label:'M'},{x:65,y:55,label:'M'},
    {x:20,y:35,label:'E'},{x:50,y:40,label:'T'},{x:80,y:35,label:'E'},
    {x:50,y:15,label:'A'}
  ],
  '3-5-2': [
    {x:50,y:90,label:'P'},
    {x:25,y:75,label:'DC'},{x:50,y:78,label:'DC'},{x:75,y:75,label:'DC'},
    {x:10,y:55,label:'E'},{x:30,y:50,label:'CC'},{x:50,y:52,label:'CC'},{x:70,y:50,label:'CC'},{x:90,y:55,label:'E'},
    {x:35,y:20,label:'A'},{x:65,y:20,label:'A'}
  ],
  '3-4-3': [
    {x:50,y:90,label:'P'},
    {x:25,y:75,label:'DC'},{x:50,y:78,label:'DC'},{x:75,y:75,label:'DC'},
    {x:15,y:50,label:'E'},{x:40,y:55,label:'CC'},{x:60,y:55,label:'CC'},{x:85,y:50,label:'E'},
    {x:20,y:25,label:'A'},{x:50,y:20,label:'A'},{x:80,y:25,label:'A'}
  ]
};

function FormationBuilder({players, formation, setFormation}:{players:Player[]; formation:FormationData; setFormation:React.Dispatch<React.SetStateAction<FormationData>>}){
  const positions = formations[formation.module] || formations['4-3-3'];
  
  const substitutes = formation.substitutes || [null, null, null, null, null, null, null, null, null];
  
  const setPosition = (index:number, playerId:number|null) => {
    setFormation(prev => ({
      ...prev,
      positions: {...prev.positions, [index]: playerId}
    }));
  };
  
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">⚽ Formazione Tattica</h3>
      <div className="mb-4">
        <label className="text-sm text-gray-600">Modulo</label>
        <select 
          className="w-full sm:w-64 px-3 py-2 border rounded-lg" 
          value={formation.module}
          onChange={e => setFormation({module: e.target.value, positions: {}, substitutes: substitutes})}
        >
          <option value="4-3-3">4-3-3</option>
          <option value="4-4-2">4-4-2</option>
          <option value="4-2-3-1">4-2-3-1</option>
          <option value="3-5-2">3-5-2</option>
          <option value="3-4-3">3-4-3</option>
        </select>
      </div>
      
      <div className="relative bg-gradient-to-b from-green-600 to-green-500 rounded-lg p-4" style={{aspectRatio:'3/4',maxWidth:600,margin:'0 auto'}}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="white" strokeWidth="0.3"/>
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.3"/>
          <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3"/>
          <circle cx="50" cy="5" r="3" fill="none" stroke="white" strokeWidth="0.3"/>
          <rect x="35" y="0" width="30" height="12" fill="none" stroke="white" strokeWidth="0.3"/>
          <rect x="42" y="0" width="16" height="5" fill="none" stroke="white" strokeWidth="0.3"/>
          <circle cx="50" cy="95" r="3" fill="none" stroke="white" strokeWidth="0.3"/>
          <rect x="35" y="88" width="30" height="12" fill="none" stroke="white" strokeWidth="0.3"/>
          <rect x="42" y="95" width="16" height="5" fill="none" stroke="white" strokeWidth="0.3"/>
          
          {positions.map((pos, idx) => {
            const player = formation.positions[idx] ? players.find(p => p.id === formation.positions[idx]) : null;
            return (
              <g key={idx}>
                <circle cx={pos.x} cy={pos.y} r="5" fill="white" stroke="#1e40af" strokeWidth="0.5"/>
                <text x={pos.x} y={pos.y+1.5} textAnchor="middle" fontSize="4" fill="#1e40af" fontWeight="bold">
                  {player ? player.number : pos.label}
                </text>
                {player && (
                  <text x={pos.x} y={pos.y-6} textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">
                    {player.lastName}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Titolari</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {positions.map((pos, idx) => {
            const selectedPlayer = formation.positions[idx];
            return (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-16">{pos.label}</span>
                <select
                  className="flex-1 px-2 py-1 border rounded-lg text-sm"
                  value={selectedPlayer || ''}
                  onChange={e => setPosition(idx, e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">— Seleziona —</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.number} — {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Sostituzioni (Panchina)</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {substitutes.map((subId, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-16">Ris. {idx + 1}</span>
              <select
                className="flex-1 px-2 py-1 border rounded-lg text-sm"
                value={subId || ''}
                onChange={e => {
                  const newSubs = [...substitutes];
                  newSubs[idx] = e.target.value ? Number(e.target.value) : null;
                  setFormation(prev => ({...prev, substitutes: newSubs}));
                }}
              >
                <option value="">— Seleziona —</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.number} — {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (username: string, password: string) => boolean }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError('Credenziali non valide');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Seguro Calcio" className="w-32 h-32 mx-auto mb-4 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900">Seguro Calcio U19</h1>
          <p className="text-gray-600 mt-2">Sistema di Gestione Squadra</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Utente</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Inserisci nome utente"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Inserisci password"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {showForgotPassword && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              Per recuperare la password, contatta l'amministratore:<br/>
              <strong>mattia.franchi89@gmail.com</strong>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Accedi
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Password dimenticata?
            </button>
          </div>
        </form>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 <strong>Primo accesso?</strong> Usa le credenziali admin predefinite:<br/>
            Username: <code className="bg-gray-100 px-1 rounded">admin</code> | Password: <code className="bg-gray-100 px-1 rounded">admin2024</code>
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ users, addUser, deleteUser, updateUserPassword }: { users: AuthUser[]; addUser: (username: string, password: string, email: string) => void; deleteUser: (username: string) => void; updateUserPassword: (username: string, newPassword: string) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUserCreated, setNewUserCreated] = useState<{ username: string; password: string; email: string } | null>(null);

  const handleAdd = () => {
    if (!form.username || !form.password || !form.email) {
      alert('Compila tutti i campi');
      return;
    }
    addUser(form.username, form.password, form.email);
    setNewUserCreated({ ...form });
    setForm({ username: '', password: '', email: '' });
    setShowAdd(false);
  };

  const handleResetPassword = () => {
    if (!newPassword) {
      alert('Inserisci una nuova password');
      return;
    }
    if (resetPasswordUser) {
      updateUserPassword(resetPasswordUser, newPassword);
      setResetPasswordUser(null);
      setNewPassword('');
      alert('Password aggiornata con successo');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gestione Utenti</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus size={18} /> Aggiungi Utente
        </button>
      </div>

      {showAdd && (
        <div className="card grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600">Nome Utente</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <button className="btn btn-primary" onClick={handleAdd}>Salva</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Annulla</button>
          </div>
        </div>
      )}

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Nome Utente</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Ruolo</th>
              <th className="text-right py-3 px-4">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.username} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.username}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`badge ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Utente'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setResetPasswordUser(user.username);
                        setNewPassword('');
                      }}
                      title="Reset Password"
                    >
                      <Key size={18} />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => {
                          if (confirm(`Eliminare utente ${user.username}?`)) {
                            deleteUser(user.username);
                          }
                        }}
                      >
                        <Trash size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset Password - {resetPasswordUser}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Inserisci nuova password"
                />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary flex-1" onClick={handleResetPassword}>
                  <Key size={18} /> Aggiorna Password
                </button>
                <button className="btn btn-ghost" onClick={() => {
                  setResetPasswordUser(null);
                  setNewPassword('');
                }}>
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newUserCreated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">✅ Utente Creato - Invia Credenziali</h3>
            <p className="text-sm text-gray-600 mb-4">
              Copia il testo qui sotto e invialo via email all'utente:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">
{`Oggetto: Credenziali di accesso - Seguro Calcio U19

Ciao,

Sei stato aggiunto al sistema di gestione della squadra Seguro Calcio U19.

Ecco le tue credenziali di accesso:

🔐 Nome Utente: ${newUserCreated.username}
🔑 Password: ${newUserCreated.password}

🌐 Link di accesso: ${window.location.origin}

Per la tua sicurezza, ti consigliamo di cambiare la password al primo accesso contattando l'amministratore.

Saluti,
Team Seguro Calcio U19`}
              </pre>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-primary flex-1"
                onClick={() => {
                  const emailText = `Oggetto: Credenziali di accesso - Seguro Calcio U19\n\nCiao,\n\nSei stato aggiunto al sistema di gestione della squadra Seguro Calcio U19.\n\nEcco le tue credenziali di accesso:\n\n🔐 Nome Utente: ${newUserCreated.username}\n🔑 Password: ${newUserCreated.password}\n\n🌐 Link di accesso: ${window.location.origin}\n\nPer la tua sicurezza, ti consigliamo di cambiare la password al primo accesso contattando l'amministratore.\n\nSaluti,\nTeam Seguro Calcio U19`;
                  navigator.clipboard.writeText(emailText);
                  alert('Testo copiato negli appunti! Ora puoi incollarlo nella tua email.');
                }}
              >
                📋 Copia Testo
              </button>
              <button className="btn btn-ghost" onClick={() => setNewUserCreated(null)}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
