const mongoose = require('mongoose');
const mongoApi = 'mongodb://127.0.0.1:27017/WanderLust';

async function connectDB() {
  try {
    await mongoose.connect(mongoApi);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    throw err;
  }
}

module.exports = { connectDB };
