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

module.exports = listingSchema;
