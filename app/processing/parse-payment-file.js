const getPaymentRequestsFromFile = require('./get-payment-requests-from-file')
const { sendBatchProcessedEvents, sendPaymentRequestInvalidEvents } = require('../event')
const { sendPaymentBatchMessages } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, scheme) => {
  try {
    const { paymentRequestsCollection } = await getPaymentRequestsFromFile(fileBuffer, scheme, filename)
    await sendParsedPaymentRequests(paymentRequestsCollection, filename, scheme)
    return true
  } catch (err) {
    console.error(`parsePaymentFile error for ${filename}:`, err)
    return false
  }
}

const sendParsedPaymentRequests = async (paymentRequestsCollection, filename, scheme) => {
  await sendBatchProcessedEvents(paymentRequestsCollection.successfulPaymentRequests, filename, scheme)
  await sendPaymentBatchMessages(paymentRequestsCollection.successfulPaymentRequests)
  await sendPaymentRequestInvalidEvents(paymentRequestsCollection.unsuccessfulPaymentRequests)

  return true
}

module.exports = parsePaymentFile
