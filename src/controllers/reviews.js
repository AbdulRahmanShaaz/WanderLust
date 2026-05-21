const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');

// Process and save a new review for a listing
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  const review = new Review(req.body.review);
  review.author = req.user._id;
  await review.save();
  listing.reviews.push(review);
  await listing.save();

  req.flash('success', 'Review added successfully.');
  res.redirect(`/listings/${listing._id}`);
};

// Remove a review and its reference from the listing
module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Review deleted successfully.');
  res.redirect(`/listings/${id}`);
};
