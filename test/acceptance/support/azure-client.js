const { BlobServiceClient } = require('@azure/storage-blob')
const { ServiceBusClient } = require('@azure/service-bus')
const config = require('./config')

let blobServiceClient = BlobServiceClient.fromConnectionString(`${config.connectionStr}`)
let container = blobServiceClient.getContainerClient(`${config.container}`)

const uploadFile = async (filename, filepath) => {
  const blob = container.getBlockBlobClient(`${config.inboundFolder}/${filename}`)
  await blob.uploadFile(filepath)
}

const receiveMessage = async () => {
  const connectionString = `Endpoint=sb://${config.host}/;SharedAccessKeyName=${config.username};SharedAccessKey=${config.password}`

  let sbClient
  let messages

  try {
    sbClient = new ServiceBusClient(connectionString)
    const receiver = sbClient.createReceiver(config.paymentAddress, config.paymentSubscriptionAddress, { receiveMode: 'receiveAndDelete' })
    console.log(`Setup to receive messages from '${config.paymentAddress}/${config.paymentSubscriptionAddress}'.`)

    const batchSize = 10
    let counter = 1

    do {
      messages = await receiver.receiveMessages(batchSize, { maxWaitTimeInMs: 30 * 1000 })
      console.log(`Received (and deleted) ${messages.length} messages.`)
      counter++
    } while (messages.length > 0 && messages.length === batchSize)
    await receiver.close()
    console.log(`No more messages in: '${config.paymentAddress}/${config.paymentSubscriptionAddress}'.`)
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
  receiveMessage
}