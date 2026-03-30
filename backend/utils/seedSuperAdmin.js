
import Admin from '../models/Admin.js';
import logger from './logger.js';

async function seedSuperAdmin() {
  try {
    const {
      SUPERADMIN_EMAIL: email,
      SUPERADMIN_PASS: plainPassword,
      SUPERADMIN_USERNAME: username = 'ADMIN-FQ-001',
      SUPERADMIN_NAME: name = 'System Superadmin',
    } = process.env;

    // 🔐 Validate required ENV variables
    if (!email || !plainPassword) {
      logger.error('❌ SUPERADMIN_EMAIL or SUPERADMIN_PASS not set in .env');
      return;
    }

    // 🔍 Check if superadmin already exists
    const exists = await Admin.findOne({ email });
    if (exists) {
      logger.info('ℹ️ Superadmin already exists', {
        email: exists.email,
        username: exists.username,
      });
      return;
    }

    // 🧾 Create new superadmin with plain password (will be hashed by pre('save'))
    const newAdmin = await Admin.create({
      name,
      email,
      username,
      password: plainPassword,
      role: 'admin',
      status: 'active',
      createdBy: 'system',
    });

    logger.info('✅ Superadmin seeded successfully', {
      id: newAdmin._id.toString(),
      email: newAdmin.email,
      username: newAdmin.username,
    });
  } catch (err) {
    logger.error('❌ Failed to seed superadmin', {
      error: err.message,
      stack: err.stack,
    });
  }
}

export default seedSuperAdmin;
