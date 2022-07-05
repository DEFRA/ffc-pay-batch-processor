const getPaymentRequestsFromFile = require('./get-payment-requests-from-file')
const { sendBatchProcessedEvents, sendPaymentRequestInvalidEvents } = require('../event')
const { sendPaymentBatchMessage } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, scheme, sequence) => {
  try {
    const { paymentRequestsCollection, batchExportDate } = await getPaymentRequestsFromFile(fileBuffer, scheme)

    await sendBatchProcessedEvents(paymentRequestsCollection.successfulPaymentRequests, filename, sequence, batchExportDate)
    await sendPaymentBatchMessage(paymentRequestsCollection.successfulPaymentRequests)
    await sendPaymentRequestInvalidEvents(paymentRequestsCollection.unsuccessfulPaymentRequests)

    return true
  } catch {
    return false
  }
}

module.exports = parsePaymentFile
