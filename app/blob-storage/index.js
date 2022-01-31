const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('../config/blob-storage')
let blobServiceClient
let containersInitialised

if (config.useConnectionStr) {
  console.log('Using connection string for BlobServiceClient')
  blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
} else {
  console.log('Using DefaultAzureCredential for BlobServiceClient')
  const uri = `https://${config.storageAccount}.blob.core.windows.net`
  blobServiceClient = new BlobServiceClient(uri, new DefaultAzureCredential())
}

const container = blobServiceClient.getContainerClient(config.container)

async function initialiseContainers () {
  console.log('Making sure blob containers exist')
  await container.createIfNotExists()
  await initialiseFolders()
  containersInitialised = true
}

async function initialiseFolders () {
  const placeHolderText = 'Placeholder'
  const inboundClient = container.getBlockBlobClient(`${config.inboundFolder}/default.txt`)
  const archiveClient = container.getBlockBlobClient(`${config.archiveFolder}/default.txt`)
  const quarantineClient = container.getBlockBlobClient(`${config.quarantineFolder}/default.txt`)
  await inboundClient.upload(placeHolderText, placeHolderText.length)
  await archiveClient.upload(placeHolderText, placeHolderText.length)
  await quarantineClient.upload(placeHolderText, placeHolderText.length)
}

async function getBlob (folder, filename) {
  containersInitialised ?? await initialiseContainers()
  return container.getBlockBlobClient(`${folder}/${filename}`)
}

async function getInboundFileList () {
  containersInitialised ?? await initialiseContainers()

  const fileList = []
  for await (const file of container.listBlobsFlat({ prefix: config.inboundFolder })) {
    if (file.name.endsWith('.dat')) {
      fileList.push(file.name.replace(`${config.inboundFolder}/`, ''))
    }
  }

  return fileList
}

async function getInboundFileDetails (filename) {
  const blob = await getBlob(config.inboundFolder, filename)
  return blob.getProperties()
}

async function downloadPaymentFile (filename) {
  const blob = await getBlob(config.inboundFolder, filename)
  return blob.downloadToBuffer()
}

// Copies blob from one folder to another folder and deletes blob from original folder
async function moveFile (sourceFolder, destinationFolder, sourceFilename, destinationFilename) {
  const sourceBlob = await getBlob(sourceFolder, sourceFilename)
  const destinationBlob = await getBlob(destinationFolder, destinationFilename)
  const copyResult = await (await destinationBlob.beginCopyFromURL(sourceBlob.url)).pollUntilDone()

  if (copyResult.copyStatus === 'success') {
    await sourceBlob.delete()
    return true
  }

  return false
}

function archivePaymentFile (filename, archiveFilename) {
  return moveFile(config.inboundFolder, config.archiveFolder, filename, archiveFilename)
}

function quarantinePaymentFile (filename, quarantineFilename) {
  return moveFile(config.inboundFolder, config.quarantineFolder, filename, quarantineFilename)
}

module.exports = {
  getInboundFileList,
  getInboundFileDetails,
  downloadPaymentFile,
  archivePaymentFile,
  quarantinePaymentFile,
  blobServiceClient
}
