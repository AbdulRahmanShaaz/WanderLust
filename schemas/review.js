const Joi = require('joi');

const reviewSchema = Joi.object({
  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .label('Rating')
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  comment: Joi.string()
    .min(5)
    .required()
    .label('Comment')
    .messages({
      'string.min': 'Comment must be at least 5 characters',
      'any.required': 'Comment is required'
    })
});

module.exports = reviewSchema;
