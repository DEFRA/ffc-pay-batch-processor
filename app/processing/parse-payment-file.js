const getPaymentRequestsFromFile = require('./get-payment-requests-from-file')
const { sendBatchProcessedEvents, sendPaymentRequestInvalidEvents } = require('../event')
const { sendPaymentBatchMessage } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, scheme, sequence) => {
  try {
    const { paymentRequests, batchExportDate } = await getPaymentRequestsFromFile(fileBuffer, scheme)

    await sendBatchProcessedEvents(paymentRequests.successfulPaymentRequests, filename, sequence, batchExportDate)
    await sendPaymentBatchMessage(paymentRequests.successfulPaymentRequests)
    await sendPaymentRequestInvalidEvents(paymentRequests.unsuccessfulPaymentRequests)

    return true
  } catch {
    return false
  }
}

module.exports = parsePaymentFile
