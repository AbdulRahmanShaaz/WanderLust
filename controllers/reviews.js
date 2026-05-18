const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  const review = new Review(req.body.review);
  await review.save();
  listing.reviews.push(review);
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
};
