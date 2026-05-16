const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const defaultListingImage =
    'https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        set: (v) => {
            const imageUrl = typeof v === 'object' && v !== null ? v.url : v;
            return imageUrl && String(imageUrl).trim() !== ''
                ? String(imageUrl).trim()
                : defaultListingImage;
        },
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
    },
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
