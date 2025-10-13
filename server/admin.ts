import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { db } from './db';
import { InsertUser, User, users } from '../shared/schema';

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

export type AdminUserStore = {
  findByUsername: (username: string) => Promise<User | undefined>;
  create: (user: InsertUser) => Promise<void>;
  updateById: (id: number, updates: Partial<InsertUser>) => Promise<void>;
};

const defaultAdminStore: AdminUserStore = {
  async findByUsername(username: string) {
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return existingAdmin;
  },
  async create(user: InsertUser) {
    await db.insert(users).values(user);
  },
  async updateById(id: number, updates: Partial<InsertUser>) {
    await db.update(users).set(updates).where(eq(users.id, id));
  },
};

export type MemoryAdminUser = User & { password: string };

export type MemoryAdminStore = AdminUserStore & {
  dump: () => MemoryAdminUser[];
};

export function createMemoryAdminStore(initialUsers: MemoryAdminUser[] = []): MemoryAdminStore {
  let sequence = initialUsers.reduce((max, user) => Math.max(max, user.id ?? 0), 0);
  const usersData = initialUsers.map((user) => ({
    ...user,
    createdAt: user.createdAt ?? new Date(),
  }));

  return {
    async findByUsername(username: string) {
      return usersData.find((user) => user.username === username);
    },
    async create(user: InsertUser) {
      const id = ++sequence;
      usersData.push({
        id,
        username: user.username!,
        password: user.password!,
        email: user.email!,
        role: (user.role as User['role']) ?? 'user',
        createdAt: user.createdAt ?? new Date(),
      });
    },
    async updateById(id: number, updates: Partial<InsertUser>) {
      const target = usersData.find((user) => user.id === id);
      if (!target) return;
      Object.assign(target, updates);
    },
    dump() {
      return usersData.map((user) => ({ ...user }));
    },
  };
}

export async function ensureAdminUser(
  options: EnsureAdminOptions = {},
  store: AdminUserStore = defaultAdminStore,
): Promise<EnsureAdminResult> {
  const username = (options.username || DEFAULT_ADMIN_USERNAME).trim();
  const email = (options.email || DEFAULT_ADMIN_EMAIL).trim();
  const password = options.password || DEFAULT_ADMIN_PASSWORD;
  const forceReset = options.forceReset ?? false;

  const existingAdmin = await store.findByUsername(username);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await store.create({ username, password: hashedPassword, email, role: 'admin' });
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

  await store.updateById(existingAdmin.id!, updatePayload);

  return { action: 'updated', username, email, updatedFields };
}
