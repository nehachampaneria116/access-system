const sequelize = require('./sequelize');
const User = require('../schema/users.model');
const Session = require('../schema/session.model');
const { hashPassword } = require('../utils/auth');

async function createMasterUser() {
  try {
    console.log('Creating master user...');

    // Setup associations
    User.associate({ Session });
    Session.belongsTo(User, { foreignKey: 'user_id' });

    const masterEmail = 'admin@admin.com';
    const masterUsername = 'admin';
    const masterPassword = 'admin123';

    // Check if master user already exists
    const existingUser = await User.findOne({
      where: { email: masterEmail }
    });

    if (existingUser) {
      console.log('✓ Master user already exists');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await hashPassword(masterPassword);

    // Create master user
    const user = await User.create({
      username: masterUsername,
      email: masterEmail,
      password: hashedPassword,
      isMaster: true
    });

    console.log('✓ Master user created successfully');
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${masterPassword}`);
    console.log('\n⚠️  Please change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Boot error:', error);
    process.exit(1);
  }
}

createMasterUser();
