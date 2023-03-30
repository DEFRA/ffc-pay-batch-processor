const azureClient = require('./azure-client')
const path = require('path')

const uploadFile = async () => {
  const HTTP_CREATED = 201
  const FILE_NAME = 'SITISFI0001_AP_20220908125135717.dat'
  const FILE_PATH = path.resolve(__dirname, '../../files', `${FILE_NAME}`)

  const response = await azureClient.uploadFile(FILE_NAME, FILE_PATH)
  if (!response === HTTP_CREATED) {
    throw new Error('Upload failed', response.error)
  }

  return response
}

const consumeMessages = async () => {
  return azureClient.receiveMessages()
}

module.exports = {
  uploadFile,
  consumeMessages
}
