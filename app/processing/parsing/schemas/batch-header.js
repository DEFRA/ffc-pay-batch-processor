const { AP, AR } = require('../../../ledgers')

const Joi = require('joi').extend(require('@joi/date'))

module.exports = Joi.object({
  exportDate: Joi.date().format('YYYY-MM-DD'),
  numberOfPaymentRequests: Joi.number().required(),
  batchValue: Joi.number().required(),
  sequence: Joi.number().integer().min(1).required(),
  sourceSystem: Joi.string().required(),
  ledger: Joi.string().valid(AP, AR).required()
})
