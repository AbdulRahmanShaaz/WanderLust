const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
  const listings = await Listing.find();
  res.render('listings/index', { listings });
};

module.exports.renderNewForm = (req, res) => {
  res.render('listings/new');
};

module.exports.createListing = async (req, res) => {
  const listing = new Listing(req.body.listing);
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
};

module.exports.showListing = async (req, res) => {
  const reviewDisplayLimit = 4;
  const reviewPage = Math.max(parseInt(req.query.reviewsPage, 10) || 0, 0);
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  const totalReviews = listing.reviews.length;
  const ratingStats = totalReviews
    ? await Review.aggregate([
      { $match: { _id: { $in: listing.reviews } } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } },
    ])
    : [];

  const visibleReviews = totalReviews
    ? await Review.find({ _id: { $in: listing.reviews } })
      .sort({ createdAt: -1 })
      .skip(reviewPage * reviewDisplayLimit)
      .limit(reviewDisplayLimit)
    : [];

  const averageRating = ratingStats.length
    ? ratingStats[0].averageRating.toFixed(1)
    : 'New';

  res.render('listings/show', {
    listing,
    averageRating,
    totalReviews,
    reviewDisplayLimit,
    reviewPage,
    visibleReviews,
    hasOlderReviews: (reviewPage + 1) * reviewDisplayLimit < totalReviews,
    hasNewerReviews: reviewPage > 0,
  });
};

module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  res.render('listings/edit', { listing });
};

module.exports.updateListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    req.body.listing,
    { new: true, runValidators: true }
  );

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyListing = async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  res.redirect('/listings');
};
