const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const validateReview = require('../middleware/validateReview');
const { isLoggedIn } = require('../middleware/isLoggedIn');
const { isReviewAuthor } = require('../middleware/isOwner');
const wrapAsync = require('../utils/wrapAsync');

// Create review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview));

// Delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.destroyReview));

module.exports = router;
