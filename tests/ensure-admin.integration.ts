import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgres://unused:unused@localhost:5432/test';
}

const adminModule = await import('../server/admin.js');
const { createMemoryAdminStore, ensureAdminUser } = adminModule;
type MemoryAdminUser = (typeof adminModule)['MemoryAdminUser'];

async function runTests() {
  const store = createMemoryAdminStore();

  const creationResult = await ensureAdminUser({
    username: 'admin',
    password: 'secret123',
    email: 'admin@example.com',
  }, store);

  assert.equal(creationResult.action, 'created');

  const createdAdmin = await store.findByUsername('admin');
  assert(createdAdmin, 'Admin user should be created');
  assert.equal(createdAdmin.email, 'admin@example.com');
  assert.equal(createdAdmin.role, 'admin');
  assert(await bcrypt.compare('secret123', createdAdmin.password), 'Stored password should be hashed');

  const unchangedResult = await ensureAdminUser({
    username: 'admin',
    password: 'secret123',
    email: 'admin@example.com',
  }, store);

  assert.equal(unchangedResult.action, 'unchanged');

  const forcedUpdateResult = await ensureAdminUser({
    username: 'admin',
    password: 'newSecret',
    email: 'admin@example.com',
    forceReset: true,
  }, store);

  assert.equal(forcedUpdateResult.action, 'updated');
  assert(forcedUpdateResult.updatedFields?.includes('password'), 'Password should be marked as updated');

  const adminAfterPasswordReset = await store.findByUsername('admin');
  assert(adminAfterPasswordReset);
  assert(await bcrypt.compare('newSecret', adminAfterPasswordReset.password), 'Password should be reset');

  const emailUpdateResult = await ensureAdminUser({
    username: 'admin',
    password: 'newSecret',
    email: 'coach@example.com',
  }, store);

  assert.equal(emailUpdateResult.action, 'updated');
  assert(emailUpdateResult.updatedFields?.includes('email'), 'Email should be marked as updated');

  const adminAfterEmailUpdate = await store.findByUsername('admin');
  assert(adminAfterEmailUpdate);
  assert.equal(adminAfterEmailUpdate.email, 'coach@example.com');

  const existingUser: MemoryAdminUser = {
    id: 99,
    username: 'legacy-admin',
    password: await bcrypt.hash('legacyPass', 6),
    email: 'legacy@example.com',
    role: 'user',
    createdAt: new Date(),
  };

  const legacyStore = createMemoryAdminStore([existingUser]);

  const legacyUpdateResult = await ensureAdminUser({
    username: 'legacy-admin',
    password: 'legacyPass',
    email: 'legacy@example.com',
  }, legacyStore);

  assert.equal(legacyUpdateResult.action, 'updated');
  assert(legacyUpdateResult.updatedFields?.includes('role'), 'Role should be corrected to admin');

  const legacyAdmin = await legacyStore.findByUsername('legacy-admin');
  assert(legacyAdmin);
  assert.equal(legacyAdmin.role, 'admin');
}

runTests()
  .then(() => {
    console.log('✅ ensureAdminUser integration tests passed');
  })
  .catch((error) => {
    console.error('❌ ensureAdminUser integration tests failed');
    console.error(error);
    process.exit(1);
  });
