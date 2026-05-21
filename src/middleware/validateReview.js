const reviewSchema = require('../schemas/review');
const ExpressError = require('../utils/ExpressError');

module.exports = (req, res, next) => {
  const { error, value } = reviewSchema.validate(req.body.review || {}, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details
      .map(d => `${d.context.label || d.path}: ${d.message}`)
      .join(', ');

    if (req.params?.id) {
      req.flash('error', messages);
      return res.redirect(`/listings/${req.params.id}#reviews`);
    }

    throw new ExpressError(400, messages);
  }

  req.body.review = value;
  next();
};
