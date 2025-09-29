const getPaymentRequestsFromFile = require('./get-payment-requests-from-file')
const { sendBatchProcessedEvents, sendPaymentRequestInvalidEvents } = require('../event')
const { sendPaymentBatchMessages } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, scheme, sequence) => {
  try {
    const { paymentRequestsCollection } = await getPaymentRequestsFromFile(fileBuffer, scheme, filename)
    await sendParsedPaymentRequests(paymentRequestsCollection, filename, scheme)
    return true
  } catch {
    return false
  }
}

const sendParsedPaymentRequests = async (paymentRequestsCollection, filename, scheme) => {
  try {
    await sendPaymentBatchMessages(paymentRequestsCollection.successfulPaymentRequests)
    await sendBatchProcessedEvents(paymentRequestsCollection.successfulPaymentRequests, filename, scheme)
    await sendPaymentRequestInvalidEvents(paymentRequestsCollection.unsuccessfulPaymentRequests)
  } catch (err) {
    console.error(`One or more payment requests could not be sent: ${err}`)
  }
  return true
}

module.exports = parsePaymentFile
