const Joi = require('joi')

module.exports = Joi.object({
  invoiceNumber: Joi.string().optional(),
  standardCode: Joi.string().required(),
  marketingYear: Joi.number().integer().min(2016).less(2099).optional(),
  productCode: Joi.string().required(),
  exchangeRate: Joi.string().optional(),
  eventDate: Joi.string().optional(),
  value: Joi.number().required(),
  description: Joi.string().required()
})
