import { db, pool } from './db.js';
import { players } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

async function clearPlayers() {
  console.log('🧹 Removing all player records...');
  const deletedPlayers = await db.delete(players).returning({ id: players.id });
  await db.execute(sql`ALTER SEQUENCE players_id_seq RESTART WITH 1`);
  console.log(`✅ Removed ${deletedPlayers.length} player${deletedPlayers.length === 1 ? '' : 's'} from the database.`);
}

clearPlayers()
  .catch((error) => {
    console.error('❌ Failed to remove players:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
