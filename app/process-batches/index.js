const { parseFilename } = require('../parse-siti-payment-file')
const blobStorage = require('../blob-storage')
const processingConfig = require('../config/processing')
const processPaymentFile = require('./process-payment-file')

async function checkAzureStorage () {
  const filenameList = await blobStorage.getInboundFileList()

  if (filenameList.length > 0) {
    for (const filename of filenameList) {
      const schemeType = parseFilename(filename)

      if (schemeType) {
        console.log(`Identified scheme as ${schemeType.scheme}`)
        await processPaymentFile(filename, schemeType)
      }
    }
  }

  setTimeout(checkAzureStorage, processingConfig.pollingInterval)
}

module.exports = checkAzureStorage
