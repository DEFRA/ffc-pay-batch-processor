const azureClient = require('./azure-client')
const path = require('path')

const uploadFile = async () => {
  const filename = `SITISFI0001_AP_20220908125135717.dat`
  const localFileWithPath = path.join(__dirname, `files/${filename}`);

  await azureClient.uploadFile(filename, localFileWithPath)
}

const consumeMessage = async () => {
  return await azureClient.receiveMessage();
}

module .exports = {
  uploadFile,
  consumeMessage
}
