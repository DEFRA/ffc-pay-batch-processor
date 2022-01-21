const joi = require('joi')

const mqSchema = joi.object({
  messageQueue: {
    host: joi.string().default('localhost'),
    useCredentialChain: joi.bool().default(false),
    type: joi.string(),
    appInsights: joi.object()
  },
  paymentBatchTopic: {
    name: joi.string().default('ffc-pay-request'),
    address: joi.string().default('payment'),
    username: joi.string(),
    password: joi.string()
  }
})
const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    useCredentialChain: process.env.NODE_ENV === 'production',
    type: 'Topic',
    appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined
  },
  paymentBatchTopic: {
    name: process.env.PAYMENT_TOPIC_NAME,
    address: process.env.PAYMENT_TOPIC_ADDRESS,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

// Throw if config is invalid
if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const paymentBatchTopic = { ...mqResult.value.messageQueue, ...mqResult.value.paymentBatchTopic }

module.exports = {
  paymentBatchTopic
}
