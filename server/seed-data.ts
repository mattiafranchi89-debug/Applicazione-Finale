import { db } from './db';
import { players, trainings, matches } from '../shared/schema';

const initialTrainings = [
  { weekNumber: 1, weekLabel: '01-07 September', sessions: [ { day: 'Lunedì', date: '2025-09-01', attendance: {} }, { day: 'Mercoledì', date: '2025-09-03', attendance: {} }, { day: 'Venerdì', date: '2025-09-05', attendance: {} } ] },
  { weekNumber: 2, weekLabel: '08-14 September', sessions: [ { day: 'Lunedì', date: '2025-09-08', attendance: {} }, { day: 'Mercoledì', date: '2025-09-10', attendance: {} }, { day: 'Venerdì', date: '2025-09-12', attendance: {} } ] },
  { weekNumber: 3, weekLabel: '15-21 September', sessions: [ { day: 'Lunedì', date: '2025-09-15', attendance: {} }, { day: 'Mercoledì', date: '2025-09-17', attendance: {} }, { day: 'Venerdì', date: '2025-09-19', attendance: {} } ] },
  { weekNumber: 4, weekLabel: '22-28 September', sessions: [ { day: 'Lunedì', date: '2025-09-22', attendance: {} }, { day: 'Mercoledì', date: '2025-09-24', attendance: {} }, { day: 'Venerdì', date: '2025-09-26', attendance: {} } ] },
  { weekNumber: 5, weekLabel: '29 Sep - 05 Oct', sessions: [ { day: 'Lunedì', date: '2025-09-29', attendance: {} }, { day: 'Mercoledì', date: '2025-10-01', attendance: {} }, { day: 'Venerdì', date: '2025-10-03', attendance: {} } ] },
];

const fixtures = [
  { date: '2025-10-12', time: '18:15', location: 'Via Antonio Aldini 77, Milano (MI)', opponent: 'SEMPIONE HALF 1919', homeAway: 'Trasferta', result: null, events: null },
  { date: '2025-10-19', time: '15:00', location: 'Via Palmanova 151, Milano (MI)', opponent: 'ACCADEMIA SAN CARLO 1969', homeAway: 'Casa', result: null, events: null },
];

async function seedData() {
  console.log('🌱 Seeding application data...');

  // Check if data already exists
  const existingTrainings = await db.select().from(trainings);
  const existingMatches = await db.select().from(matches);

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
