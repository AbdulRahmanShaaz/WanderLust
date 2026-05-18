const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const validateReview = require('../middleware/validateReview');
const wrapAsync = require('../utils/wrapAsync');

router.post('/', validateReview, wrapAsync(reviews.createReview));
router.delete('/:reviewId', wrapAsync(reviews.destroyReview));

module.exports = router;
