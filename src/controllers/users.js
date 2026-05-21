const passport = require('passport');
const User = require('../models/user');

// Render the user registration form
module.exports.renderSignupForm = (req, res) => {
  if (req.isAuthenticated()) {
    req.flash('success', 'You are already signed in.');
    return res.redirect('/listings');
  }

  res.render('users/signup');
};

// Process user registration and automatically log them in
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body.user || {};

    if (!username || !email || !password || !confirmPassword) {
      req.flash('error', 'Please fill out all signup fields.');
      return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/signup');
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

// Render the user login form
module.exports.renderLoginForm = (req, res) => {
  if (req.isAuthenticated()) {
    req.flash('success', 'You are already signed in.');
    return res.redirect('/listings');
  }

  res.render('users/login');
};

// Process user login and redirect to intended destination
module.exports.login = (req, res) => {
  req.flash('success', `Welcome back to WanderLust!`);
  const redirectUrl = res.locals.returnTo || '/listings';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// Process user logout and destroy session
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash('success', 'You have been signed out.');
    res.redirect('/listings');
  });
};
