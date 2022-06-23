const { GBP, EUR } = require('../../currency')
const { Q4, M12, T4 } = require('../../schedules')

const Joi = require('joi').extend(require('@joi/date'))

module.exports = Joi.object({
  sourceSystem: Joi.string().required(),
  deliveryBody: Joi.string().regex(/^[A-Z]{2}\d{2}$/).required(),
  invoiceNumber: Joi.string().required(),
  frn: Joi.number().integer().min(1000000000).max(9999999999).required(),
  marketingYear: Joi.number().integer().greater(2015).less(2099).required(),
  paymentRequestNumber: Joi.number().integer().required(),
  agreementNumber: Joi.string().optional(),
  contractNumber: Joi.string().required(),
  currency: Joi.string().valid(GBP, EUR).required(),
  schedule: Joi.string().valid(Q4, M12, T4).optional(),
  dueDate: Joi.date().format('YYYY-MM-DD'),
  value: Joi.number().required(),
  correlationId: Joi.string().required(),
  invoiceLines: Joi.array().required()
})
