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
