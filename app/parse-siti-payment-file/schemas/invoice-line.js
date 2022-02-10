const Joi = require('joi')

module.exports = Joi.object({
  standardCode: Joi.string().allow(''),
  schemeCode: Joi.string().required(),
  accountCode: Joi.string().allow(''),
  fundCode: Joi.string().required(),
  description: Joi.string().required(),
  value: Joi.number().required()
})
