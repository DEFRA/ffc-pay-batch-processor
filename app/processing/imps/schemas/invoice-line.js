const Joi = require('joi')

module.exports = Joi.object({
  exchangeRate: Joi.number().optional(),
  marketingYear: Joi.number().integer().min(2016).less(2099).optional(),
  productCode: Joi.string().required(),
  value: Joi.number().required(),
  description: Joi.string().required()
})
