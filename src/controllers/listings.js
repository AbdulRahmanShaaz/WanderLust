const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');

// Retrieve and display all listings
module.exports.index = async (req, res) => {
  const listings = await Listing.find();
  res.render('listings/index', { listings });
};

// Render form to create a new listing
module.exports.renderNewForm = (req, res) => {
  res.render('listings/new');
};

// Process new listing creation
module.exports.createListing = async (req, res) => {
  const listing = new Listing(req.body.listing);
  if (req.file) {
    listing.image = req.file.path;
  }
  listing.owner = req.user._id;
  await listing.save();
  req.flash('success', 'New listing created successfully.');
  res.redirect(`/listings/${listing._id}`);
};

// Display a single listing and its paginated reviews
module.exports.showListing = async (req, res) => {
  const reviewDisplayLimit = 4;
  const reviewPage = Math.max(parseInt(req.query.reviewsPage, 10) || 0, 0);
  const listing = await Listing.findById(req.params.id).populate('owner');

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  const reviewsArray = Array.isArray(listing.reviews) ? listing.reviews : [];
  const totalReviews = reviewsArray.length;
  const ratingStats = totalReviews
    ? await Review.aggregate([
      { $match: { _id: { $in: reviewsArray } } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } },
    ])
    : [];

  const visibleReviews = totalReviews
    ? await Review.find({ _id: { $in: reviewsArray } })
      .populate('author')
      .sort({ createdAt: -1 })
      .skip(reviewPage * reviewDisplayLimit)
      .limit(reviewDisplayLimit)
    : [];

  const averageRating = ratingStats.length
    ? ratingStats[0].averageRating.toFixed(1)
    : 'New';

  const ratingGroups = totalReviews
    ? await Review.aggregate([
      { $match: { _id: { $in: listing.reviews } } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ])
    : [];

  const countByStars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingGroups.forEach((g) => {
    if (g._id >= 1 && g._id <= 5) {
      countByStars[g._id] = g.count;
    }
  });

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = countByStars[stars];
    return {
      stars,
      count,
      percent: totalReviews ? Math.round((count * 100) / totalReviews) : 0,
    };
  });

  res.render('listings/show', {
    listing,
    averageRating,
    totalReviews,
    reviewDisplayLimit,
    reviewPage,
    visibleReviews,
    ratingBreakdown,
    hasOlderReviews: (reviewPage + 1) * reviewDisplayLimit < totalReviews,
    hasNewerReviews: reviewPage > 0,
  });
};

// Render form to edit an existing listing
module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  res.render('listings/edit', { listing });
};

// Process updates to a specific listing
module.exports.updateListing = async (req, res) => {
  const updates = { ...req.body.listing };
  if (req.file) {
    updates.image = req.file.path;
  }

  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  req.flash('success', 'Listing updated successfully.');
  res.redirect(`/listings/${listing._id}`);
};

// Remove a listing from the database
module.exports.destroyListing = async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  req.flash('success', 'Listing deleted successfully.');
  res.redirect('/listings');
};
