const sendBatchMessage = require('./send-batch-message')
const config = require('../config/mq-config')

async function sendPaymentBatchMessage (payload) {
  await sendBatchMessage(payload, 'uk.gov.pay.send', config.paymentBatchTopic)
  console.info('Payment request sent', payload)
}

module.exports = {
  sendPaymentBatchMessage
}
