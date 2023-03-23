const { BlobServiceClient } = require('@azure/storage-blob')
const { ServiceBusClient } = require('@azure/service-bus')
const config = require('./config')
let containerCreated = false

const blobServiceClient = BlobServiceClient.fromConnectionString(`${config.connectionStr}`)
const container = blobServiceClient.getContainerClient(`${config.container}`)

const initialiseContainer = async () => {
  if (!containerCreated) {
    await container.createIfNotExists()
    containerCreated = true
  }
}
const uploadFile = async (filename, filepath) => {
  initialiseContainer()
  const blob = container.getBlockBlobClient(`${config.inboundFolder}/${filename}`)
  await blob.uploadFile(filepath)
}

const receiveMessages = async () => {
  const connectionString = `Endpoint=sb://${config.host}/;SharedAccessKeyName=${config.username};SharedAccessKey=${config.password}`
  let sbClient
  let messages

  try {
    sbClient = new ServiceBusClient(connectionString)
    const receiver = sbClient.createReceiver(config.paymentAddress, config.paymentSubscriptionAddress, { receiveMode: 'receiveAndDelete' })
    console.log(`Setup to receive messages from '${config.paymentAddress}/${config.paymentSubscriptionAddress}'.`)

    const batchSize = 2
    messages = await receiver.receiveMessages(batchSize, { maxWaitTimeInMs: 60 * 1000 })
    console.log(`Received (and deleted) ${messages.length} messages.`)

    await receiver.close()
  } catch (err) {
    console.log('Error:', err)
    throw err
  } finally {
    await sbClient.close()
  }

  return messages.map(x => x.body)
}

module.exports = {
  uploadFile,
  receiveMessages
}
