const listingSchema = require('../schemas/listing');
const ExpressError = require('../utils/ExpressError');

module.exports = (req, res, next) => {
  const { error, value } = listingSchema.validate(req.body?.listing || {}, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details
      .map(d => `${d.context.label || d.path}: ${d.message}`)
      .join(', ');
    throw new ExpressError(400, messages);
  }

  req.body.listing = value;
  next();
};
