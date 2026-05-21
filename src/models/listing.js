const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const defaultListingImage =
    'https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 20,
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
        minlength: 2,
    },
    country: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [77.209, 28.6139] // Default: New Delhi
        }
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

listingSchema.post('findOneAndDelete', async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
