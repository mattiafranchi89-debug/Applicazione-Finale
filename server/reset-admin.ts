import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function resetAdmin() {
  try {
    console.log('🔐 Resetting admin credentials...');

    const newPassword = process.argv[2] || process.env.ADMIN_RESET_PASSWORD || 'admin2024';
    const adminEmail = process.argv[3] || process.env.ADMIN_EMAIL || 'mattia.franchi89@gmail.com';

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'admin'))
      .limit(1);

    if (existingAdmin) {
      await db
        .update(users)
        .set({ password: hashedPassword, role: 'admin', email: adminEmail })
        .where(eq(users.username, 'admin'));
      console.log('✅ Admin password reset successfully.');
    } else {
      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        email: adminEmail,
        role: 'admin'
      });
      console.log('✅ Admin user recreated successfully.');
    }

    console.log('   Username: admin');
    console.log(`   Password: ${newPassword}`);
    console.log(`   Email: ${adminEmail}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to reset admin credentials:', error);
    process.exit(1);
  }
}

resetAdmin();
