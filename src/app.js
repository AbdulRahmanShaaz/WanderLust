const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');

const ExpressError = require('./utils/ExpressError');
const getErrorResponse = require('./utils/getErrorResponse');
const listingRoutes = require('./routes/listings');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const User = require('./models/user');
const { getCardImageUrl, getShowImageUrl, getOptimizedImageUrl } = require('./utils/cloudinaryHelpers');
const MongoStore = require('connect-mongo').default;
const app = express();

const isProduction = process.env.NODE_ENV === 'production';


const rootDir = path.join(__dirname, '..');

const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WanderLust';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!' },
  touchAfter: 24 * 3600,
});

store.on('error', (err) => {
  console.error('SESSION STORE ERROR:', err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,   // HTTPS only in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));

// Trust proxy (required for secure cookies behind Render/Railway/Heroku)
if (isProduction) app.set('trust proxy', 1);

// Security headers (allow Cloudinary, Mapbox, Font Awesome, Google Fonts)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://kit.fontawesome.com', 'https://api.mapbox.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://unpkg.com'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', 'https://ka-f.fontawesome.com', 'https://cdnjs.cloudflare.com', 'https://unpkg.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://ka-f.fontawesome.com', 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://images.unsplash.com', 'https://tile.openstreetmap.org', 'https://*.tile.openstreetmap.org', 'https://*.tile.openstreetmap.org'],
      connectSrc: ["'self'", 'https://api.mapbox.com', 'https://events.mapbox.com'],
      workerSrc: ["'self'", 'blob:'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false,
}));

// NoSQL injection prevention (Express-5 compatible — sanitizes req.body only)
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
});

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
  res.locals.currentUser = req.user || null;
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
