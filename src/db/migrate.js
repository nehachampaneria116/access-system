const sequelize = require('./sequelize');
const User = require('../schema/users.model');
const Session = require('../schema/session.model');

async function migrate() {
  try {
    console.log('Running migrations...');

    // Setup associations
    User.associate({ Session });
    Session.belongsTo(User, { foreignKey: 'user_id' });

    // Sync database
    await sequelize.sync({ force: false });

    console.log('✓ Users table created/updated');
    console.log('✓ Sessions table created/updated');
    console.log('✓ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
