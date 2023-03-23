const azureClient = require('./azure-client')
const path = require('path')

const uploadFile = async () => {
  const HTTP_OK = 201
  const FILE_NAME = 'SITISFI0001_AP_20220908125135717.dat'
  const FILE_PATH = path.join(__dirname, '..', '..', 'files', `${FILE_NAME}`)

  const response = await azureClient.uploadFile(FILE_NAME, FILE_PATH)
  if (!response === HTTP_OK) {
    throw console.error('Upload failed')
  }
}

const consumeMessages = async () => {
  return await azureClient.receiveMessages()
}

module.exports = {
  uploadFile,
  consumeMessages
}
