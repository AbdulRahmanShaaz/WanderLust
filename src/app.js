const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const ExpressError = require('./utils/ExpressError');
const getErrorResponse = require('./utils/getErrorResponse');
const listingRoutes = require('./routes/listings');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const User = require('./models/user');
const { getCardImageUrl, getShowImageUrl, getOptimizedImageUrl } = require('./utils/cloudinaryHelpers');

const app = express();

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'wanderlust-dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

const rootDir = path.join(__dirname, '..');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  res.locals.getCardImageUrl = getCardImageUrl;
  res.locals.getShowImageUrl = getShowImageUrl;
  res.locals.getOptimizedImageUrl = getOptimizedImageUrl;
  res.locals.mapboxToken = process.env.MAPBOX_TOKEN;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/listings');
});

app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.all('/{*splat}', (req, res, next) => {
  next(new ExpressError(404, 'Page not found'));
});

app.use((err, req, res, next) => {
  const { statusCode, message } = getErrorResponse(err);

  console.error(err);
  res.status(statusCode).render('error', { statusCode, message });
});

module.exports = app;
