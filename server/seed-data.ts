import { db } from './db';
import { players, trainings, matches } from '../shared/schema';

const initialPlayers = [
  { id: 1, firstName: 'Gabriele', lastName: 'Russo', number: 1, role: 'Portiere', goals: 0, minutesPlayed: 0, birthYear: 2007 },
  { id: 2, firstName: 'Andrea', lastName: 'Capasso', number: 12, role: 'Portiere', goals: 0, minutesPlayed: 0, birthYear: 2007 },
  { id: 3, firstName: 'Gabriele', lastName: 'Lucchini', number: 2, role: 'Terzino Destro', goals: 1, minutesPlayed: 0, birthYear: 2006 },
  { id: 4, firstName: 'Davide', lastName: 'Toscano', number: 3, role: 'Terzino Destro', goals: 0, minutesPlayed: 0, birthYear: 2007 },
  { id: 5, firstName: 'Giovanni', lastName: 'Montalto', number: 4, role: 'Difensore Centrale', goals: 2, minutesPlayed: 0, birthYear: 2006 },
  { id: 6, firstName: 'Massimo', lastName: 'Calvone', number: 5, role: 'Difensore Centrale', goals: 1, minutesPlayed: 0, birthYear: 2007 },
  { id: 7, firstName: 'Elia', lastName: 'Restivo', number: 6, role: 'Terzino Sinistro', goals: 0, minutesPlayed: 0, birthYear: 2007 },
  { id: 8, firstName: 'Lorenzo', lastName: 'Dopinto', number: 8, role: 'Centrocampista Centrale', goals: 3, minutesPlayed: 0, birthYear: 2006 },
  { id: 9, firstName: 'Filippo', lastName: 'Lesino', number: 7, role: 'Centrocampista Centrale', goals: 2, minutesPlayed: 0, birthYear: 2007 },
  { id: 10, firstName: 'Riccardo', lastName: 'Brocca', number: 10, role: 'Centrocampista Centrale', goals: 4, minutesPlayed: 0, birthYear: 2005 },
  { id: 11, firstName: 'Filippo', lastName: 'Cogliati', number: 11, role: 'Ala', goals: 5, minutesPlayed: 0, birthYear: 2007 },
  { id: 12, firstName: 'Abdullah', lastName: 'Tahsif', number: 14, role: 'Ala', goals: 3, minutesPlayed: 0, birthYear: 2007 },
  { id: 13, firstName: 'Afif', lastName: 'Adam', number: 15, role: 'Ala', goals: 2, minutesPlayed: 0, birthYear: 2007 },
  { id: 14, firstName: 'Cristian', lastName: "D'Agostino", number: 16, role: 'Ala', goals: 4, minutesPlayed: 0, birthYear: 2006 },
  { id: 15, firstName: 'Gabriele', lastName: 'Mazzei', number: 17, role: 'Ala', goals: 3, minutesPlayed: 0, birthYear: 2007 },
  { id: 16, firstName: 'Andrei', lastName: 'Dorosan', number: 9, role: 'Attaccante', goals: 8, minutesPlayed: 0, birthYear: 2007 },
  { id: 17, firstName: 'Gaetano', lastName: 'Cristian', number: 18, role: 'Attaccante', goals: 6, minutesPlayed: 0, birthYear: 2007 },
  { id: 18, firstName: 'Domenico', lastName: 'Romito', number: 19, role: 'Attaccante', goals: 7, minutesPlayed: 0, birthYear: 2007 },
  { id: 19, firstName: 'Enrico', lastName: 'Amelotti', number: 20, role: 'Attaccante', goals: 5, minutesPlayed: 0, birthYear: 2007 },
];

const initialTrainings = [
  { weekNumber: 1, weekLabel: '01-07 September', sessions: [ { day: 'Lunedì', date: '2025-09-01', attendance: {} }, { day: 'Mercoledì', date: '2025-09-03', attendance: {} }, { day: 'Venerdì', date: '2025-09-05', attendance: {} } ] },
  { weekNumber: 2, weekLabel: '08-14 September', sessions: [ { day: 'Lunedì', date: '2025-09-08', attendance: {} }, { day: 'Mercoledì', date: '2025-09-10', attendance: {} }, { day: 'Venerdì', date: '2025-09-12', attendance: {} } ] },
  { weekNumber: 3, weekLabel: '15-21 September', sessions: [ { day: 'Lunedì', date: '2025-09-15', attendance: {} }, { day: 'Mercoledì', date: '2025-09-17', attendance: {} }, { day: 'Venerdì', date: '2025-09-19', attendance: {} } ] },
  { weekNumber: 4, weekLabel: '22-28 September', sessions: [ { day: 'Lunedì', date: '2025-09-22', attendance: {} }, { day: 'Mercoledì', date: '2025-09-24', attendance: {} }, { day: 'Venerdì', date: '2025-09-26', attendance: {} } ] },
  { weekNumber: 5, weekLabel: '29 Sep - 05 Oct', sessions: [ { day: 'Lunedì', date: '2025-09-29', attendance: {} }, { day: 'Mercoledì', date: '2025-10-01', attendance: {} }, { day: 'Venerdì', date: '2025-10-03', attendance: {} } ] },
];

const fixtures = [
  { id: 1,  round: 1,  date: '2025-09-20', time: '18:00', home: 'Vighignolo', away: 'Seguro', address: 'Via Pace S.N.C.', city: 'Settimo Milanese Fr. Vighignolo', result: '4-3', events: [] },
  { id: 2,  round: 2,  date: '2025-09-27', time: '14:45', home: 'Seguro', away: 'Villapizzone', address: 'Via Sandro Pertini 13', city: 'Seguro', result: '1-1', events: [] },
  { id: 3,  round: 3,  date: '2025-10-04', time: '18:15', home: 'Sempione Half 1919', away: 'Seguro', address: 'Via Arturo Graf, 4', city: 'Milano', result: '1-1', events: [] },
  { id: 4,  round: 4,  date: '2025-10-11', time: '14:45', home: 'Seguro', away: 'Polisportiva Or. Pa. S.', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 5,  round: 5,  date: '2025-10-18', time: '17:30', home: 'Cassina Nuova', away: 'Seguro', address: 'Via Oglio, 1/3', city: 'Bollate Fraz. Cassina Nuova', result: null, events: null },
  { id: 6,  round: 6,  date: '2025-10-25', time: '14:45', home: 'Seguro', away: 'Cob 91', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 7,  round: 7,  date: '2025-11-01', time: '17:30', home: 'Ardor Bollate', away: 'Seguro', address: 'Via Repubblica 6', city: 'Bollate', result: null, events: null },
  { id: 8,  round: 8,  date: '2025-11-08', time: '14:45', home: 'Garibaldina 1932', away: 'Seguro', address: 'Via Don Giovanni Minzoni 4', city: 'Milano', result: null, events: null },
  { id: 9,  round: 9,  date: '2025-11-15', time: '14:45', home: 'Seguro', away: 'Quinto Romano', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 10, round: 10, date: '2025-11-22', time: '17:45', home: 'Pro Novate', away: 'Seguro', address: 'Via V. Torlani 6', city: 'Novate Milanese', result: null, events: null },
  { id: 11, round: 11, date: '2025-11-29', time: '14:45', home: 'Seguro', away: 'Calcio Bonola', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 12, round: 12, date: '2025-12-06', time: '18:00', home: 'Bollatese', away: 'Seguro', address: 'Via Varalli n. 2', city: 'Bollate', result: null, events: null },
  { id: 13, round: 13, date: '2025-12-13', time: '14:45', home: 'Seguro', away: 'Vigor FC', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 14, round: 14, date: '2026-01-17', time: '14:45', home: 'Seguro', away: 'Vighignolo', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 15, round: 15, date: '2026-01-24', time: '18:15', home: 'Villapizzone', away: 'Seguro', address: 'Via Perin del Vaga 11', city: 'Milano', result: null, events: null },
  { id: 16, round: 16, date: '2026-01-31', time: '14:45', home: 'Seguro', away: 'Sempione Half 1919', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 17, round: 17, date: '2026-02-07', time: '16:00', home: 'Polisportiva Or. Pa. S.', away: 'Seguro', address: 'Via Comasina 115', city: 'Milano', result: null, events: null },
  { id: 18, round: 18, date: '2026-02-14', time: '14:45', home: 'Seguro', away: 'Cassina Nuova', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 19, round: 19, date: '2026-02-21', time: '18:00', home: 'Cob 91', away: 'Seguro', address: 'Via Fabio Filzi, 31', city: 'Cormano', result: null, events: null },
  { id: 20, round: 20, date: '2026-02-28', time: '14:45', home: 'Seguro', away: 'Ardor Bollate', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 21, round: 21, date: '2026-03-07', time: '14:45', home: 'Seguro', away: 'Garibaldina 1932', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 22, round: 22, date: '2026-03-14', time: '17:00', home: 'Quinto Romano', away: 'Seguro', address: 'Via Vittorio De Sica, 14', city: 'Quinto Romano', result: null, events: null },
  { id: 23, round: 23, date: '2026-03-21', time: '14:45', home: 'Seguro', away: 'Pro Novate', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 24, round: 24, date: '2026-03-28', time: '18:00', home: 'Calcio Bonola', away: 'Seguro', address: 'Via Fichi, 1', city: 'Milano', result: null, events: null },
  { id: 25, round: 25, date: '2026-04-11', time: '14:45', home: 'Seguro', away: 'Bollatese', address: 'Via Sandro Pertini 13', city: 'Seguro', result: null, events: null },
  { id: 26, round: 26, date: '2026-04-18', time: '15:30', home: 'Vigor FC', away: 'Seguro', address: 'Via San Michele del Carso, 55', city: 'Paderno Dugnano', result: null, events: null },
];

async function seedData() {
  console.log('🌱 Seeding application data...');

  // Check if data already exists
  const existingPlayers = await db.select().from(players);
  const existingTrainings = await db.select().from(trainings);
  const existingMatches = await db.select().from(matches);

  if (existingPlayers.length === 0) {
    console.log('👥 Inserting players...');
    for (const player of initialPlayers) {
      await db.insert(players).values(player);
    }
    console.log(`✅ Inserted ${initialPlayers.length} players`);
  } else {
    console.log('✓ Players already seeded');
  }

  if (existingTrainings.length === 0) {
    console.log('📅 Inserting training weeks...');
    for (const training of initialTrainings) {
      await db.insert(trainings).values(training);
    }
    console.log(`✅ Inserted ${initialTrainings.length} training weeks`);
  } else {
    console.log('✓ Training weeks already seeded');
  }

  if (existingMatches.length === 0) {
    console.log('⚽ Inserting matches...');
    for (const match of fixtures) {
      await db.insert(matches).values(match);
    }
    console.log(`✅ Inserted ${fixtures.length} matches`);
  } else {
    console.log('✓ Matches already seeded');
  }

  console.log('🎉 Data seeding completed');
}

seedData()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
