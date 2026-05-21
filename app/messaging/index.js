const config = require('../config/message')
const sendBatchMessages = require('./send-batch-messages')

const sendPaymentBatchMessages = async (messages) => {
  await sendBatchMessages(messages, 'uk.gov.defra.ffc.pay.request', config.paymentBatchTopic)
  console.info('Publishing valid payment requests', messages?.map(({ frn, sbi, paymentRequestNumber }) => ({ frn, sbi, paymentRequestNumber })))
}

module.exports = {
  sendPaymentBatchMessages
}
