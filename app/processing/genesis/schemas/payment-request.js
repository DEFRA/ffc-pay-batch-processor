const Joi = require('joi')

module.exports = Joi.object({
  sourceSystem: Joi.string().required(),
  batch: Joi.string().required(),
  invoiceNumber: Joi.string().required(),
  vendor: Joi.string().required(),
  marketingYear: Joi.number().integer().min(1993).less(2099).optional(),
  paymentRequestNumber: Joi.number().integer().required(),
  contractNumber: Joi.string().required(),
  value: Joi.number().required(),
  correlationId: Joi.string().required(),
  invoiceLines: Joi.array().min(1).required()
})
