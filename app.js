const express = require('express');
const path = require('path');
const { connectDB } = require('./db');
const Listing = require('./models/listing');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const getErrorResponse = require('./utils/getErrorResponse');

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

app.post('/listings', wrapAsync(async (req, res) => {
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

app.put('/listings/:id', wrapAsync(async (req, res) => {
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
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }
  res.render('listings/show', { listing });
}));

app.all('/{*splat}', (req, res, next) => {
  next(new ExpressError(404, 'Page not found'));
});

app.use((err, req, res, next) => {
  const { statusCode, message } = getErrorResponse(err);

  console.error(err);
  res.status(statusCode).render('error', { err, statusCode, message });
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
