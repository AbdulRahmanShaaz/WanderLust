const express = require('express');
const router = express.Router();
const listings = require('../controllers/listings');
const validateListing = require('../middleware/validateListing');
const wrapAsync = require('../utils/wrapAsync');

router
  .route('/')
  .get(wrapAsync(listings.index))
  .post(validateListing, wrapAsync(listings.createListing));

router.get('/new', listings.renderNewForm);

router
  .route('/:id')
  .get(wrapAsync(listings.showListing))
  .put(validateListing, wrapAsync(listings.updateListing))
  .delete(wrapAsync(listings.destroyListing));

router.get('/:id/edit', wrapAsync(listings.renderEditForm));

module.exports = router;
