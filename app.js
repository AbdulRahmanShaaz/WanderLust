const express = require('express');
const path = require('path');
const { connectDB } = require('./db');
const Listing = require('./models/listing');
const Review = require('./models/reviews');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const getErrorResponse = require('./utils/getErrorResponse');
const validateListing = require('./middleware/validateListing');
const validateReview = require('./middleware/validateReview');

const app = express();
const port = process.env.PORT || 8080;

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.redirect('/listings');
});  
app.get('/listings', wrapAsync(async (req, res) => {
  const listings = await Listing.find();
  res.render('listings/index', { listings });
}));

app.get('/listings/new', (req, res) => {
  res.render('listings/new');
});

app.post('/listings', validateListing, wrapAsync(async (req, res) => {
  const listing = new Listing(req.body.listing);
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }
  res.render('listings/edit', { listing });
}));

app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    req.body.listing,
    { new: true, runValidators: true }
  );

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  res.redirect(`/listings/${listing._id}`);
}));

app.delete('/listings/:id', wrapAsync(async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }
  res.redirect('/listings');
}));

app.get('/listings/:id', wrapAsync(async (req, res) => {
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
}));

app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  const review = new Review(req.body.review);
  await review.save();
  listing.reviews.push(review);
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));

app.all('/{*splat}', (req, res, next) => {
  next(new ExpressError(404, 'Page not found'));
});

app.use((err, req, res, next) => {
  const { statusCode, message } = getErrorResponse(err);

  // Log full error details to the server console for debugging
  console.error(err);

  // Render only the user-friendly status and message to the client
  res.status(statusCode).render('error', { statusCode, message });
});

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});
