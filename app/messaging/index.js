const util = require('util')
const config = require('../config/message')
const sendBatchMessages = require('./send-batch-messages')

const sendPaymentBatchMessages = async (messages) => {
  await sendBatchMessages(messages, 'uk.gov.pay.request', config.paymentBatchTopic)
  console.info('Payment requests sent', util.inspect(messages, false, null, true))
}

module.exports = {
  sendPaymentBatchMessages
}
