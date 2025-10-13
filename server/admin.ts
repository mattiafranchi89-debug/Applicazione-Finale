import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { db } from './db';
import { InsertUser, users } from '../shared/schema';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

export const DEFAULT_ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
export const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'mattia.franchi89@gmail.com').trim();
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_RESET_PASSWORD || 'admin2024';

export type EnsureAdminOptions = {
  username?: string;
  password?: string;
  email?: string;
  forceReset?: boolean;
};

type EnsureAdminResult =
  | { action: 'created'; username: string; email: string }
  | { action: 'updated'; username: string; email: string; updatedFields: (keyof InsertUser)[] }
  | { action: 'unchanged'; username: string; email: string };

export async function ensureAdminUser(options: EnsureAdminOptions = {}): Promise<EnsureAdminResult> {
  const username = (options.username || DEFAULT_ADMIN_USERNAME).trim();
  const email = (options.email || DEFAULT_ADMIN_EMAIL).trim();
  const password = options.password || DEFAULT_ADMIN_PASSWORD;
  const forceReset = options.forceReset ?? false;

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await db.insert(users).values({ username, password: hashedPassword, email, role: 'admin' });
    return { action: 'created', username, email };
  }

  const updatedFields: (keyof InsertUser)[] = [];
  const updatePayload: Partial<InsertUser> = {};

  const passwordMatches = await bcrypt.compare(password, existingAdmin.password);
  if (forceReset || !passwordMatches) {
    updatePayload.password = await bcrypt.hash(password, SALT_ROUNDS);
    updatedFields.push('password');
  }

  if (existingAdmin.role !== 'admin') {
    updatePayload.role = 'admin';
    updatedFields.push('role');
  }

  if (existingAdmin.email !== email) {
    updatePayload.email = email;
    updatedFields.push('email');
  }

  if (updatedFields.length === 0) {
    return { action: 'unchanged', username, email };
  }

  await db.update(users).set(updatePayload).where(eq(users.id, existingAdmin.id));

  return { action: 'updated', username, email, updatedFields };
}
