
const config = {
  connectionStr: process.env.AZURE_STORAGE_CONNECTION_STRING,
  storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  container: process.env.AZURE_STORAGE_CONTAINERS,
  paymentAddress: process.env.PAYMENT_TOPIC_ADDRESS,
  paymentSubscriptionAddress: process.env.PAYMENT_TOPIC_SUBSCRIPTION_ADDRESS,
  inboundFolder: process.env.AZURE_STORAGE_INBOUNDFOLDER,
  host: process.env.MESSAGE_QUEUE_HOST,
  username: process.env.MESSAGE_QUEUE_USER,
  password: process.env.MESSAGE_QUEUE_PASSWORD
}

module.exports  = config
