if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const Listing = require('../src/models/listing');
const sampleListings = require('./data/sample-listings');
const { connectDB } = require('../src/config/database');
const { prepareCloudinaryListings } = require('./utils/prepareCloudinaryListings');
const getSeedOwner = require('./utils/getSeedOwner');

async function seedDatabase() {
  await connectDB();

  try {
    const count = await Listing.countDocuments();
    if (count > 0) {
      console.log(
        `Database already has ${count} listing(s). Skipping seed. Run "npm run reseed" to reset with Cloudinary URLs.`
      );
      return;
    }

    console.log(`Uploading ${sampleListings.length} images to Cloudinary...`);
    const preparedListings = await prepareCloudinaryListings(sampleListings);
    const owner = await getSeedOwner();

    await Listing.insertMany(preparedListings.map((listing) => ({ ...listing, owner })));
    console.log(`Seeded ${preparedListings.length} listing(s) with Cloudinary image URLs.`);
  } catch (err) {
    console.error('Failed to seed database:', err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
