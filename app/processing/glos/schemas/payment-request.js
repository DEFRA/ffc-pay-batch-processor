const Joi = require('joi').extend(require('@joi/date'))

module.exports = Joi.object({
  correlationId: Joi.string().required(),
  sourceSystem: Joi.string().required(),
  schemeId: Joi.number().integer().positive().required(),
  batch: Joi.string().required(),
  invoiceNumber: Joi.string().required(),
  paymentRequestNumber: Joi.number().integer().required(),
  frn: Joi.number().integer().min(1000000000).max(9999999999).required(),
  sbi: Joi.number().integer().min(100000000).max(999999999).required(),
  claimDate: Joi.string().required(),
  invoiceLines: Joi.array().min(1).required()
})
