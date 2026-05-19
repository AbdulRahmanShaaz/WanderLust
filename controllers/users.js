const passport = require('passport');
const User = require('../models/user');
const ExpressError = require('../utils/ExpressError');

module.exports.renderSignupForm = (req, res) => {
  if (req.isAuthenticated()) {
    req.flash('success', 'You are already signed in.');
    return res.redirect('/listings');
  }

  res.render('users/signup');
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body.user || {};

    if (password !== confirmPassword) {
      throw new ExpressError(400, 'Passwords do not match.');
    }

    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash('success', `Welcome to WanderLust, ${registeredUser.username}.`);
      res.redirect('/listings');
    });
  } catch (err) {
    if (err.name === 'UserExistsError') {
      req.flash('error', 'That username is already taken.');
      return res.redirect('/signup');
    }

    if (err.code === 11000 && err.keyPattern?.email) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/signup');
    }

    next(err);
  }
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash('success', 'You have been signed out.');
    res.redirect('/listings');
  });
};
