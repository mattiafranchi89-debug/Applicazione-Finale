import { db } from './db';
import { players, trainings, matches } from '../shared/schema';
import {
  INITIAL_MATCHES,
  INITIAL_PLAYERS,
  INITIAL_TRAINING_WEEKS,
} from '../shared/initialData';

async function seedData() {
  console.log('🌱 Seeding application data...');

  const existingPlayers = await db.select().from(players);
  const existingTrainings = await db.select().from(trainings);
  const existingMatches = await db.select().from(matches);

  if (existingPlayers.length === 0 && INITIAL_PLAYERS.length > 0) {
    console.log('👥 Inserting players...');
    for (const player of INITIAL_PLAYERS) {
      await db.insert(players).values({
        firstName: player.firstName,
        lastName: player.lastName,
        number: player.number,
        position: player.position,
        goals: player.goals ?? 0,
        presences: player.presences ?? 0,
        birthYear: player.birthYear,
        yellowCards: player.yellowCards ?? 0,
        redCards: player.redCards ?? 0,
      });
    }
    console.log(`✅ Inserted ${INITIAL_PLAYERS.length} players`);
  } else {
    console.log('✓ Players already seeded or no initial players defined');
  }

  if (existingTrainings.length === 0 && INITIAL_TRAINING_WEEKS.length > 0) {
    console.log('📅 Inserting training weeks...');
    for (const training of INITIAL_TRAINING_WEEKS) {
      await db.insert(trainings).values({
        weekNumber: training.weekNumber,
        weekLabel: training.weekLabel,
        sessions: training.sessions,
      });
    }
    console.log(`✅ Inserted ${INITIAL_TRAINING_WEEKS.length} training weeks`);
  } else {
    console.log('✓ Training weeks already seeded or no initial weeks defined');
  }

  if (existingMatches.length === 0 && INITIAL_MATCHES.length > 0) {
    console.log('⚽ Inserting matches...');
    for (const match of INITIAL_MATCHES) {
      await db.insert(matches).values({
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
    console.log(`✅ Inserted ${INITIAL_MATCHES.length} matches`);
  } else {
    console.log('✓ Matches already seeded or no initial matches defined');
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
