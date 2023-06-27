const Joi = require('joi')

module.exports = Joi.object({
  companyCode: Joi.string().required(),
  costCentre: Joi.string().required(),
  standardCode: Joi.string().required(),
  accountCode: Joi.string().required(),
  subAccountCode: Joi.string().required(),
  projectCode: Joi.string().optional(),
  value: Joi.number().required(),
  description: Joi.string().required()
})
