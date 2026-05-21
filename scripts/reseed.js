if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const Listing = require('../src/models/listing');
const Review = require('../src/models/review');
const sampleListings = require('./data/sample-listings');
const { connectDB } = require('../src/config/database');
const { prepareCloudinaryListings } = require('./utils/prepareCloudinaryListings');
const getSeedOwner = require('./utils/getSeedOwner');

async function verifyCloudinaryCredentials() {
  const { cloudinary } = require('../src/config/cloudinary');
  await cloudinary.api.ping();
}

async function reseedDatabase() {
  await connectDB();

  try {
    console.log('Verifying Cloudinary credentials...');
    await verifyCloudinaryCredentials();
    console.log('Cloudinary credentials OK.');

    console.log(`Uploading ${sampleListings.length} images to Cloudinary (database not touched yet)...`);
    const preparedListings = await prepareCloudinaryListings(sampleListings);
    const owner = await getSeedOwner();

    console.log('Replacing listings in database...');
    await Review.deleteMany({});
    await Listing.deleteMany({});
    await Listing.insertMany(preparedListings.map((listing) => ({ ...listing, owner })));

    console.log(`Done. ${preparedListings.length} listing(s) now use Cloudinary image URLs.`);
  } catch (err) {
    console.error('Database reseed failed:', err.message || err);
    console.error('Your existing listings were NOT removed.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

reseedDatabase();