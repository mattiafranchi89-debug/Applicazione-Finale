import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function seed() {
  console.log('🌱 Seeding database...');

  // Check if admin already exists
  const existingAdmin = await db.select()
    .from(users)
    .where(eq(users.username, 'admin'))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin2024', SALT_ROUNDS);
  
  await db.insert(users).values({
    username: 'admin',
    password: hashedPassword,
    email: 'mattia.franchi89@gmail.com',
    role: 'admin'
  });

  console.log('✅ Admin user created successfully');
  console.log('   Username: admin');
  console.log('   Password: admin2024');
  console.log('   Email: mattia.franchi89@gmail.com');
}

seed()
  .then(() => {
    console.log('🎉 Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
