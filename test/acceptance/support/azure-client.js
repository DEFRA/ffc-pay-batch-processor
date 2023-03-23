const { BlobServiceClient } = require('@azure/storage-blob')
const { ServiceBusClient } = require('@azure/service-bus')
const config = require('./config')
let containerCreated = false

const blobServiceClient = BlobServiceClient.fromConnectionString(`${config.connectionStr}`)
const container = blobServiceClient.getContainerClient(`${config.container}`)
const connectionString = `Endpoint=sb://${config.host}/;SharedAccessKeyName=${config.username};SharedAccessKey=${config.password}`

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
  const sbClient = new ServiceBusClient(connectionString)
  const receiver = sbClient.createReceiver(config.paymentAddress, config.paymentSubscriptionAddress, { receiveMode: 'receiveAndDelete' })
  const batchSize = 2

  try {
    const allMessages = []
    console.log(`Setup to receive messages from '${config.paymentAddress}/${config.paymentSubscriptionAddress}'.`)

    while (allMessages.length < batchSize) {
      const messages = await receiver.receiveMessages(batchSize, { maxWaitTimeInMs: 20 * 1000 })

      if (!messages.length) {
        console.log('No more messages to receive')
        break
      }

      console.log(`Received (and deleted) ${messages.length} messages.`)
      allMessages.push(...messages)
    }

    await receiver.close()
    return allMessages.map(message => message.body)
  } catch (err) {
    console.log('Error:', err)
    throw err
  } finally {
    await sbClient.close()
  }
}

module.exports = {
  uploadFile,
  receiveMessages
}
