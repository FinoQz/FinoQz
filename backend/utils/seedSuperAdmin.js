const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

module.exports = async () => {
  const exists = await Admin.findOne({ email: 'info.finoqz@gmail.com' });
  if (exists) return;

  const hashed = await bcrypt.hash('Finoqz@12345', 12);
  await Admin.create({
    name: 'Siddhart Singh',
    email: 'info.finoqz@gmail.com',
    username: 'ADMIN-FQ-001',
    password: hashed,
  });

  console.log('Superadmin seeded');
};

// const Admin = require('../models/Admin');
// const bcrypt = require('bcrypt');
// const logger = require('./logger'); // ✅ structured logger

// module.exports = async () => {
//   try {
//     const email = process.env.SUPERADMIN_EMAIL;
//     const password = process.env.SUPERADMIN_PASS;

//     if (!email || !password) {
//       logger.error('❌ Superadmin credentials not set in ENV');
//       return;
//     }

//     const exists = await Admin.findOne({ email });
//     if (exists) {
//       logger.info('ℹ️ Superadmin already exists');
//       return;
//     }

//     const hashed = await bcrypt.hash(password, 12);
//     await Admin.create({
//       name: process.env.SUPERADMIN_NAME || 'System Superadmin',
//       email,
//       username: process.env.SUPERADMIN_USERNAME || 'ADMIN-FQ-001',
//       password: hashed,
//       role: 'superadmin',
//       createdBy: 'system',
//       createdAt: new Date()
//     });

//     logger.info('✅ Superadmin seeded successfully', { email });
//   } catch (err) {
//     logger.error('❌ Failed to seed superadmin', { error: err.message });
//   }
// };
