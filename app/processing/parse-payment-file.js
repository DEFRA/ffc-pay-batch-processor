const getPaymentRequestsFromFile = require('./get-payment-requests-from-file')
const { sendBatchProcessedEvents, sendPaymentRequestInvalidEvents } = require('../event')
const { sendPaymentBatchMessage } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, scheme, sequence) => {
  try {
    const { paymentRequestsCollection, batchExportDate } = await getPaymentRequestsFromFile(fileBuffer, scheme)
    await sendParsedPaymentRequests(paymentRequestsCollection, filename, sequence, batchExportDate)
    return true
  } catch {
    return false
  }
}

const sendParsedPaymentRequests = async (paymentRequestsCollection, filename, sequence, batchExportDate) => {
  try {
    await sendBatchProcessedEvents(paymentRequestsCollection.successfulPaymentRequests, filename, sequence, batchExportDate)
    await sendPaymentBatchMessage(paymentRequestsCollection.successfulPaymentRequests)
    await sendPaymentRequestInvalidEvents(paymentRequestsCollection.unsuccessfulPaymentRequests)
    return true
  } catch (err) {
    console.error(`One or more payment requests could not be sent: ${err}`)
    return true
  }
}

module.exports = parsePaymentFile
