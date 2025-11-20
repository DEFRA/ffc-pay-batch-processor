const schema = require('./schemas/batch-header')

const validateBatch = (batchHeader, paymentRequests) => {
  if (batchHeader.length !== 1) return false

  const validSchema = isValidSchema(batchHeader[0])
  const numberOfPaymentRequestsValid = batchHeader[0].numberOfPaymentRequests === paymentRequests.length

  return validSchema && numberOfPaymentRequestsValid
}

const isValidSchema = (batchHeader) => {
  const validationResult = schema.validate(batchHeader)
  if (validationResult.error) {
    console.error(`Batch header is invalid. ${validationResult.error.message}`)
    return false
  }
  return true
}

module.exports = validateBatch
