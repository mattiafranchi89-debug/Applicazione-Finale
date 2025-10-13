import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  ensureAdminUser,
} from './admin.js';

async function resetAdmin() {
  try {
    console.log('🔐 Resetting admin credentials...');

    const newPassword = process.argv[2] || process.env.ADMIN_RESET_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    const adminEmail = process.argv[3] || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    const adminUsername = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;

    const result = await ensureAdminUser({
      username: adminUsername,
      password: newPassword,
      email: adminEmail,
      forceReset: true,
    });

    if (result.action === 'created') {
      console.log('✅ Admin user recreated successfully.');
    } else if (result.action === 'updated') {
      console.log(`✅ Admin user updated (${result.updatedFields.join(', ')}).`);
    } else {
      console.log('ℹ️ Admin user already up to date.');
    }

    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Email: ${adminEmail}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to reset admin credentials:', error);
    process.exit(1);
  }
}

resetAdmin();
