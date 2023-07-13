const Joi = require('joi').extend(require('@joi/date'))

module.exports = Joi.object({
  sourceSystem: Joi.string().required(),
  batch: Joi.string().required(),
  invoiceNumber: Joi.string().required(),
  paymentRequestNumber: Joi.number().integer().required(),
  frn: Joi.number().integer().min(1000000000).max(9999999999).required(),
  sbi: Joi.string().required(),
  claimDate: Joi.string().required(),
  correlationId: Joi.string().required(),
  invoiceLines: Joi.array().min(1).required()
})
