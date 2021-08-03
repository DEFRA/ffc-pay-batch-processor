const sendMessage = require('./send-message')
const config = require('../config/mq-config')

async function sendPaymentBatchMessage (payload) {
  await sendMessage(payload, 'uk.gov.sfi.payment.send', config.paymentBatchTopic)
  console.info('Payment Sent')
}

module.exports = {
  sendPaymentBatchMessage
}
