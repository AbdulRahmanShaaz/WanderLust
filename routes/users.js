const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const wrapAsync = require('../utils/wrapAsync');

router
  .route('/signup')
  .get(users.renderSignupForm)
  .post(wrapAsync(users.signup));

router
  .route('/login')
  .get(users.renderLoginForm)
  .post(
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    users.login
  );

router.post('/logout', users.logout);

module.exports = router;
