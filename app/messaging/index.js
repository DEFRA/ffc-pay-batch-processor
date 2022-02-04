const sendBatchMessage = require('./send-batch-message')
const config = require('../config/mq-config')
const util = require('util')

async function sendPaymentBatchMessage (payload) {
  await sendBatchMessage(payload, 'uk.gov.pay.send', config.paymentBatchTopic)
  console.info('Payment requests sent', util.inspect(payload, false, null, true))
}

module.exports = {
  sendPaymentBatchMessage
}
