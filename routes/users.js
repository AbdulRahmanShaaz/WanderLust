const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const wrapAsync = require('../utils/wrapAsync');

router
  .route('/signup')
  .get(users.renderSignupForm)
  .post(wrapAsync(users.signup));

router.post('/logout', users.logout);

module.exports = router;
