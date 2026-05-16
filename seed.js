const mongoose = require('mongoose');
const Listing = require('./models/listing');
const sampleListings = require('./init/data');
const { connectDB } = require('./db');

async function seedDatabase() {
  await connectDB();

  try {
    const count = await Listing.countDocuments();
    if (count === 0) {
      const preparedListings = sampleListings.map(listing => ({
        ...listing,
        image: listing.image && typeof listing.image === 'object' ? listing.image.url : listing.image,
      }));

      await Listing.insertMany(preparedListings);
      console.log('Seeded sample listings');
    } else {
      console.log(`Database already has ${count} listing(s). Skipping seeding.`);
    }
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
