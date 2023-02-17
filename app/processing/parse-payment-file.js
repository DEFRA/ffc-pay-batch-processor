const getPaymentRequestsFromFile = require('./get-payment-requests-from-file')
const { sendBatchProcessedEvents, sendPaymentRequestInvalidEvents } = require('../event')
const { sendPaymentBatchMessages } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, scheme, sequence) => {
  try {
    const { paymentRequestsCollection, batchExportDate } = await getPaymentRequestsFromFile(fileBuffer, scheme, filename)
    await sendParsedPaymentRequests(paymentRequestsCollection, filename, sequence, batchExportDate)
    return true
  } catch {
    return false
  }
}

const sendParsedPaymentRequests = async (paymentRequestsCollection, filename, sequence, batchExportDate) => {
  try {
    await sendPaymentBatchMessages(paymentRequestsCollection.successfulPaymentRequests)
    await sendBatchProcessedEvents(paymentRequestsCollection.successfulPaymentRequests, filename, sequence, batchExportDate)
    await sendPaymentRequestInvalidEvents(paymentRequestsCollection.unsuccessfulPaymentRequests)
  } catch (err) {
    console.error(`One or more payment requests could not be sent: ${err}`)
  }
  return true
}

module.exports = parsePaymentFile
