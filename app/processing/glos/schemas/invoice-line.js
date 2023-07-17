const Joi = require('joi')

module.exports = Joi.object({
  standardCode: Joi.string().required(),
  description: Joi.string().required(),
  value: Joi.number().required()
})
