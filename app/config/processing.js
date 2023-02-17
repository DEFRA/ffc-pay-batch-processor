const Joi = require('joi')

// Define config schema
const schema = Joi.object({
  pollingInterval: Joi.number().default(10000), // 10 seconds
  maxProcessingTries: Joi.number().default(3),
  disableSequenceValidation: Joi.boolean().default(false),
  useV1Events: Joi.boolean().default(true),
  useV2Events: Joi.boolean().default(true)
})

// Build config
const config = {
  pollingInterval: process.env.POLLING_INTERVAL,
  maxProcessingTries: process.env.MAX_PROCESSING_TRIES,
  disableSequenceValidation: process.env.DISABLE_SEQUENCE_VALIDATION,
  useV1Events: process.env.USE_V1_EVENTS,
  useV2Events: process.env.USE_V2_EVENTS
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The processing config is invalid. ${result.error.message}`)
}

if (result.value.disableSequenceValidation) {
  console.log('Sequence validation disabled')
}

module.exports = result.value
