const sendBatchMessage = require('./send-batch-message')
const config = require('../config/message')
const util = require('util')

const sendPaymentBatchMessage = async (messages) => {
  await sendBatchMessage(messages, 'uk.gov.pay.request', config.paymentBatchTopic)
  console.info('Payment requests sent', util.inspect(messages, false, null, true))
}

module.exports = {
  sendPaymentBatchMessage
}
