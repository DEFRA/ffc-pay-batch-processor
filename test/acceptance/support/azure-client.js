const { BlobServiceClient } = require('@azure/storage-blob')
const { ServiceBusClient } = require('@azure/service-bus')
const config = require('./config')

const blobServiceClient = BlobServiceClient.fromConnectionString(`${config.connectionStr}`)
const container = blobServiceClient.getContainerClient(`${config.container}`)
const connectionString = `Endpoint=sb://${config.host}/;SharedAccessKeyName=${config.username};SharedAccessKey=${config.password}`
let sbClient

const uploadFile = async (filename, filepath) => {
  await container.createIfNotExists()
  const blob = container.getBlockBlobClient(`${config.inboundFolder}/${filename}`)
  await blob.uploadFile(filepath)
}

const receiveMessages = async (message = 'Peeking & deleting') => {
  const batchSize = 10
  const receiver = initReciever()
  console.log(`${message} from '${config.paymentAddress}/${config.paymentSubscriptionAddress}'.`)
  return getAllMessages(receiver, batchSize)
}

const getAllMessages = async (receiver, batchSize) => {
  const allMessages = []
  let messages

  try {
    do {
      messages = await receiver.receiveMessages(batchSize, { maxWaitTimeInMs: 20 * 1000 })
      allMessages.push(...messages)
    } while (allMessages.length < batchSize && messages > 0)

    console.log(`Received and (deleted) ${allMessages.length}`)
    await receiver.close()
    return allMessages.map(message => message.body)
  } catch (err) {
    throw new Error(`Unable to read from ${config.paymentSubscriptionAddress}. `, err)
  } finally {
    await sbClient.close()
  }
}

const initReciever = () => {
  sbClient = new ServiceBusClient(connectionString)
  return sbClient.createReceiver(config.paymentAddress, config.paymentSubscriptionAddress, { receiveMode: 'receiveAndDelete' })
}

module.exports = {
  uploadFile,
  receiveMessages
}
