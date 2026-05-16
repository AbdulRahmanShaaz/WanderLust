const seedDatabase = require('../seed');

if (typeof seedDatabase === 'function') {
  seedDatabase();
}

