const Joi = require('joi')

module.exports = Joi.object({
  sourceSystem: Joi.string().valid(),
  ledger: Joi.string(),
  deliveryBody: Joi.string(),
  invoiceNumber: Joi.string(),
  frn: Joi.number().greater(1000000000).less(9999999999).required(),
  sbi: Joi.number().integer().greater(105000000).less(999999999).optional(),
  marketingYear: Joi.number().integer().greater(2020).less(2099).required(),
  paymentRequestNumber: Joi.number().required(),
  agreementNumber: Joi.string(),
  contractNumber: Joi.string(),
  currency: Joi.string(),
  schedule: Joi.string(),
  dueDate: Joi.string(),
  debtType: Joi.string().allow(''),
  recoveryDate: Joi.string().allow(''),
  originalSettlementDate: Joi.string().allow(''),
  value: Joi.number().required(),
  invoiceLines: Joi.array().required()
})
