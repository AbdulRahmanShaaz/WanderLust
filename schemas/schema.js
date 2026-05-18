const Joi = require('joi');

const listingSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(100)
    .required()
    .label('Title')
    .messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .min(20)
    .required()
    .label('Description')
    .messages({
      'string.min': 'Description must be at least 20 characters',
      'any.required': 'Description is required'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .label('Price')
    .messages({
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  location: Joi.string()
    .min(2)
    .required()
    .label('Location'),
  country: Joi.string()
    .min(2)
    .required()
    .label('Country'),
  image: Joi.string()
    .uri()
    .allow('')
    .label('Image')
});

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

module.exports = listingSchema;
module.exports.reviewSchema = reviewSchema;
