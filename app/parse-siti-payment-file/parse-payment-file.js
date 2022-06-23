const { buildAndTransformParseFile } = require('./build-payment-file')
const { sendBatchProcessedEvents, sendBatchErrorEvent } = require('../event')
const { sendPaymentBatchMessage } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, schemeType) => {
  try {
    const { paymentRequests, batchExportDate } = await buildAndTransformParseFile(fileBuffer, schemeType)
    await sendBatchProcessedEvents(filename, paymentRequests, schemeType.batchId, batchExportDate)
    await sendPaymentBatchMessage(paymentRequests)
    return true
  } catch (err) {
    await sendBatchErrorEvent(filename, err)
    console.log(err)
  }

  return false
}

module.exports = { parsePaymentFile }
