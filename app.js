const express = require('express');
const path = require('path');
const { connectDB } = require('./db');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const getErrorResponse = require('./utils/getErrorResponse');
const listingRoutes = require('./routes/listings');
const reviewRoutes = require('./routes/reviews');

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

app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);

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
