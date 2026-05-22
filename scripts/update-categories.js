if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const Listing = require('../src/models/listing');
const { connectDB } = require('../src/config/database');

function getCategoryForListing(listing) {
  const title = listing.title.toLowerCase();
  const description = listing.description.toLowerCase();

  if (title.includes('beachfront') || title.includes('beach') || title.includes('ocean') || 
      description.includes('beachfront') || description.includes('beach') || description.includes('ocean')) {
    return 'Beachfront';
  }
  
  if (title.includes('mountain') || title.includes('ski') || title.includes('cabin') || 
      description.includes('mountain') || description.includes('ski') || description.includes('cabin')) {
    return 'Mountain';
  }
  
  if (title.includes('countryside') || title.includes('cottage') || title.includes('rustic') || 
      description.includes('countryside') || description.includes('cottage') || description.includes('rustic')) {
    return 'Countryside';
  }
  
  if (title.includes('luxury') || title.includes('penthouse') || title.includes('villa') || listing.price > 3000) {
    return 'Luxury';
  }
  
  if (title.includes('budget') || listing.price < 1000) {
    return 'Budget';
  }
  
  return 'City';
}

async function updateCategories() {
  await connectDB();
  
  try {
    const listings = await Listing.find({});
    
    console.log(`Found ${listings.length} listings to update...`);
    
    let updatedCount = 0;
    
    for (const listing of listings) {
      const category = getCategoryForListing(listing);
      
      if (!listing.category || listing.category !== category) {
        listing.category = category;
        await listing.save();
        updatedCount++;
        console.log(`Updated "${listing.title}" to category: ${category}`);
      }
    }
    
    console.log(`\nSuccessfully updated ${updatedCount} listings!`);
    
  } catch (err) {
    console.error('Error updating categories:', err);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  updateCategories();
}

module.exports = updateCategories;
