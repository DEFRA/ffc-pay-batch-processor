const Joi = require('joi')
const { AP, AR } = require('../../../constants/ledger')

module.exports = Joi.object({
  sourceSystem: Joi.string().required(),
  batch: Joi.string().required(),
  invoiceNumber: Joi.string().required(),
  trader: Joi.string().required(),
  ledger: Joi.string().allow(AP, AR).required(),
  marketingYear: Joi.number().integer().min(2015).less(2099).optional(),
  paymentRequestNumber: Joi.number().integer().required(),
  contractNumber: Joi.string().required(),
  exchangeRate: Joi.string().optional(),
  eventDate: Joi.string().optional(),
  correlationId: Joi.string().required(),
  invoiceLines: Joi.array().min(1).required()
})
