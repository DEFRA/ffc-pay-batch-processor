const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('./config/storage')
let blobServiceClient
let containersInitialised
let foldersInitialised

if (config.useConnectionStr) {
  console.log('Using connection string for BlobServiceClient')
  blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
} else {
  console.log('Using DefaultAzureCredential for BlobServiceClient')
  const uri = `https://${config.storageAccount}.blob.core.windows.net`
  blobServiceClient = new BlobServiceClient(uri, new DefaultAzureCredential())
}

const container = blobServiceClient.getContainerClient(config.container)

const initialiseContainers = async () => {
  if (config.createContainers) {
    console.log('Making sure blob containers exist')
    await container.createIfNotExists()
    console.log('Containers ready')
  }
  foldersInitialised ?? await initialiseFolders()
  containersInitialised = true
}

const initialiseFolders = async () => {
  console.log('Making sure folders exist')
  const placeHolderText = 'Placeholder'
  const inboundClient = container.getBlockBlobClient(`${config.inboundFolder}/default.txt`)
  await inboundClient.upload(placeHolderText, placeHolderText.length)
  foldersInitialised = true
  console.log('Folders ready')
}

const getBlob = async (folder, filename) => {
  containersInitialised ?? await initialiseContainers()
  return container.getBlockBlobClient(`${folder}/${filename}`)
}

const getInboundFileList = async () => {
  containersInitialised ?? await initialiseContainers()

  const fileList = []
  for await (const file of container.listBlobsFlat({ prefix: config.inboundFolder })) {
    if (file.name.endsWith('.dat') || file.name.endsWith('.gne') || file.name.endsWith('.INT')) {
      fileList.push(file.name.replace(`${config.inboundFolder}/`, ''))
    }
  }

  return fileList
}

const getInboundFileDetails = async (filename) => {
  const blob = await getBlob(config.inboundFolder, filename)
  return blob.getProperties()
}

const downloadPaymentFile = async (filename) => {
  const blob = await getBlob(config.inboundFolder, filename)
  return blob.downloadToBuffer()
}

// Copies blob from one folder to another folder and deletes blob from original folder
const moveFile = async (sourceFolder, destinationFolder, sourceFilename, destinationFilename) => {
  const sourceBlob = await getBlob(sourceFolder, sourceFilename)
  const destinationBlob = await getBlob(destinationFolder, destinationFilename)
  const copyResult = await (await destinationBlob.beginCopyFromURL(sourceBlob.url)).pollUntilDone()

  if (copyResult.copyStatus === 'success') {
    await sourceBlob.delete()
    return true
  }

  return false
}

const archivePaymentFile = async (filename, archiveFilename) => {
  return moveFile(config.inboundFolder, config.archiveFolder, filename, archiveFilename)
}

const quarantinePaymentFile = async (filename, quarantineFilename) => {
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
