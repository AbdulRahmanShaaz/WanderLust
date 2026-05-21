const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const wrapAsync = require('../utils/wrapAsync');
const { storeReturnTo } = require('../middleware/isLoggedIn');

// User Registration
router
  .route('/signup')
  .get(users.renderSignupForm)
  .post(wrapAsync(users.signup));

// User Login
router
  .route('/login')
  .get(users.renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    users.login
  );

// User Logout
router.post('/logout', users.logout);

module.exports = router;
