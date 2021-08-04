const sendBatchMessage = require('./send-batch-message')
const config = require('../config/mq-config')

async function sendPaymentBatchMessage (payload) {
  await sendBatchMessage(payload, 'uk.gov.sfi.payment.send', config.paymentBatchTopic)
  console.info('Payment Sent')
}

module.exports = {
  sendPaymentBatchMessage
}
