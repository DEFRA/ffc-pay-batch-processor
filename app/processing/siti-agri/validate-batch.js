const { convertToPence, getTotalValueInPence } = require('../../currency-convert')
const schema = require('./schemas/batch-header')

const validateBatch = (batchHeader, paymentRequests) => {
  if (batchHeader.length !== 1) return false

  const validSchema = isValidSchema(batchHeader[0])
  const numberOfPaymentRequestsValid = batchHeader[0].numberOfPaymentRequests === paymentRequests.length
  const batchValueTotalsValid = convertToPence(batchHeader[0].batchValue) === getTotalValueInPence(paymentRequests, 'value')

  return validSchema && numberOfPaymentRequestsValid && batchValueTotalsValid
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
