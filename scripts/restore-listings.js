if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const Listing = require('../src/models/listing');
const sampleListings = require('./data/sample-listings');
const { connectDB } = require('../src/config/database');
const getSeedOwner = require('./utils/getSeedOwner');

function toListingRecord(listing, owner) {
  return {
    title: listing.title,
    description: listing.description,
    image:
      listing.image && typeof listing.image === 'object'
        ? listing.image.url
        : listing.image,
    price: listing.price,
    location: listing.location,
    country: listing.country,
    owner,
  };
}

async function restoreListings() {
  await connectDB();

  try {
    const count = await Listing.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} listing(s). Nothing to restore.`);
      return;
    }

    const owner = await getSeedOwner();
    const listings = sampleListings.map((listing) => toListingRecord(listing, owner));
    await Listing.insertMany(listings);
    console.log(`Restored ${listings.length} listing(s) with source image URLs.`);
  } catch (err) {
    console.error('Restore failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

restoreListings();
