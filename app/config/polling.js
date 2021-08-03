const Joi = require('joi')

// Define config schema
const schema = Joi.object({
  pollingInterval: Joi.number().default(60000)
})

// Build config
const config = {
  pollingInterval: process.env.POLLING_INTERVAL
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The polling config is invalid. ${result.error.message}`)
}

module.exports = result.value
