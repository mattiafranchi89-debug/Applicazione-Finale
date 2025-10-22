import * as schema from "../shared/schema.js";

// DATABASE_URL must be set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Support both Neon serverless (websocket) and a regular Postgres connection string.
// If DATABASE_URL looks like a Neon URL (wss:// or includes "neon"), use neon-serverless.
// Otherwise fall back to node-postgres (pg) which works with localhost/postgres containers.
let db: any;

if (process.env.DATABASE_URL.startsWith('wss:') || process.env.DATABASE_URL.includes('neon')) {
  // Neon serverless via websocket
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = (await import('ws')).default;
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Regular Postgres (localhost) using node-postgres
  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');
  // Use node-postgres Pool as client for drizzle using the node-postgres adapter
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { db };
