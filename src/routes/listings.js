const express = require('express');
const router = express.Router();
const listings = require('../controllers/listings');
const validateListing = require('../middleware/validateListing');
const uploadListingImage = require('../middleware/uploadListingImage');
const { isLoggedIn } = require('../middleware/isLoggedIn');
const { isOwner } = require('../middleware/isOwner');
const wrapAsync = require('../utils/wrapAsync');

// Core listing routes (Index & Create)
router
  .route('/')
  .get(wrapAsync(listings.index))
  .post(
    isLoggedIn,
    uploadListingImage.single('image'),
    validateListing,
    wrapAsync(listings.createListing)
  );

// New listing form
router.get('/new', isLoggedIn, listings.renderNewForm);

// Specific listing operations (Show, Update, Delete)
router
  .route('/:id')
  .get(wrapAsync(listings.showListing))
  .put(
    isLoggedIn,
    isOwner,
    uploadListingImage.single('image'),
    validateListing,
    wrapAsync(listings.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listings.destroyListing));

// Edit listing form
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listings.renderEditForm));

module.exports = router;