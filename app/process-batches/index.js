const blobStorage = require('../blob-storage')
const pollingInterval = require('../config/polling').pollingInterval
const { parsePaymentFile, parseFilename, filenameMasks } = require('../parse-siti-payment-file')

const processSfiPaymentFile = async (fileName, buffer) => {
  console.log(`Processing ${fileName}`)
  const schemeType = parseFilename(fileName, filenameMasks.sfi)
  if (schemeType.scheme === 'SITIELM') {
    await parsePaymentFile(buffer, schemeType.batchId)
  }
}

const processPaymentFiles = async (fileNameList) => {
  console.log(`Found files to process ${fileNameList}`)
  for (const fileName of fileNameList) {
    const buffer = await blobStorage.downloadPaymentFile(fileName)
    await processSfiPaymentFile(fileName, buffer)
  }
}

async function checkAzureStorage () {
  console.log('Checking Azure Storage')
  const fileNameList = await blobStorage.getInboundFileList()
  console.log(fileNameList)
  if (fileNameList.length > 0) {
    await processPaymentFiles(fileNameList)
  }

  setTimeout(checkAzureStorage, pollingInterval)
}

module.exports = checkAzureStorage
