const Joi = require('joi').extend(require('@joi/date'))

module.exports = Joi.object({
  exportDate: Joi.date().format('DD/MM/YYYY').required(),
  numberOfPaymentRequests: Joi.number().required(),
  batchValue: Joi.number().required(),
  sequence: Joi.number().integer().min(1).required(),
  sourceSystem: Joi.string().required()
})
