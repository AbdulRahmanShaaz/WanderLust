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
    throw new ExpressError(400, messages);
  }

  req.body.review = value;
  next();
};
