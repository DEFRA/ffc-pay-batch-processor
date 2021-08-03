const blobStorage = require('../blob-storage')
const pollingInterval = require('../config/polling').pollingInterval

function processPaymentFiles (fileNameList) {
  console.log(`Found files to process ${fileNameList}`)
}

async function checkAzureStorage () {
  console.log('Checking Azure Storage')
  const fileNameList = await blobStorage.getInboundFileList()

  if (fileNameList.length > 0) {
    processPaymentFiles(fileNameList)
  }

  setTimeout(checkAzureStorage, pollingInterval)
}

module.exports = checkAzureStorage
