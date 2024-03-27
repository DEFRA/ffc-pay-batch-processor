const config = {
  connectionStr: process.env.AZURE_STORAGE_CONNECTION_STRING,
  storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  container: 'batch',
  inboundFolder: 'inbound',
  paymentAddress: process.env.PAYMENT_TOPIC_ADDRESS,
  paymentSubscriptionAddress: process.env.PAYMENT_SUBSCRIPTION_ADDRESS,
  host: process.env.MESSAGE_QUEUE_HOST,
  username: process.env.MESSAGE_QUEUE_USER,
  password: process.env.MESSAGE_QUEUE_PASSWORD
}

module.exports = config
