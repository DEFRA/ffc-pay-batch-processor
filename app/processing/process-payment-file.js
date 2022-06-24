const reprocessIfNeeded = require('./reprocess-if-needed')
const { sendBatchErrorEvent } = require('../event')
const processIfValid = require('./process-if-valid')

const processPaymentFile = async (filename, scheme) => {
  try {
    console.log(`Processing ${filename}`)
    const reprocessed = await reprocessIfNeeded(filename, scheme)

    if (!reprocessed) {
      await processIfValid(scheme, filename)
    }
  } catch (err) {
    await sendBatchErrorEvent(filename, err)
    console.error(`Error thrown processing ${filename}`)
    console.error(err)
  }
}

module.exports = processPaymentFile
