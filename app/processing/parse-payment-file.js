const getPaymentRequestsFromFile = require('./get-payment-requests-from-file')
const { sendBatchProcessedEvents, sendPaymentRequestInvalidEvents } = require('../event')
const { sendPaymentBatchMessage } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, scheme, sequence) => {
  let paymentRequestsCollection, batchExportDate

  try {
    const parsedPaymentFile = await getPaymentRequestsFromFile(fileBuffer, scheme)
    paymentRequestsCollection = parsedPaymentFile.paymentRequestsCollection
    batchExportDate = parsedPaymentFile.batchExportDate
  } catch {
    return false
  }

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
