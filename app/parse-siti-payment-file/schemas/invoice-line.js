const Joi = require('joi')

module.exports = Joi.object({
  schemeCode: Joi.string().required(),
  accountCode: Joi.string().regex(/^[A-Z]{3}\d{3}$/).optional(),
  fundCode: Joi.string().regex(/^[A-Z]{3}\d{2}$/).required(),
  description: Joi.string().regex(/^[A-Z]{1}\d{2}\s-\s.+$/).required(),
  value: Joi.number().required()
})
