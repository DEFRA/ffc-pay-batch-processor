const { createServiceBusClient } = require('./create-service-bus-client')

const clients = new Map()
const senders = new Map()
let closing = false

const getClient = (config) => {
  if (closing) {
    throw new Error('Service Bus client is closing')
  }

  if (!clients.has(config.host)) {
    clients.set(config.host, createServiceBusClient(config))
  }

  return clients.get(config.host)
}

const getSender = (config) => {
  if (closing) {
    throw new Error('Service Bus sender is closing')
  }

  if (!senders.has(config.address)) {
    const sbClient = getClient(config)
    senders.set(config.address, sbClient.createSender(config.address))
  }

  return senders.get(config.address)
}

const closeSender = async (address) => {
  if (senders.has(address)) {
    try {
      await senders.get(address).close()
    } catch (err) {
      console.error('Error closing sender:', err)
    }
    senders.delete(address)
  }
}

const closeSenders = async () => {
  if (closing) {
    return
  }
  closing = true

  for (const sender of senders.values()) {
    try {
      await sender.close()
    } catch (err) {
      console.error('Error closing sender:', err)
    }
  }
  senders.clear()

  for (const client of clients.values()) {
    try {
      await client.close()
    } catch (err) {
      console.error('Error closing Service Bus client:', err)
    }
  }
  clients.clear()
}

const clearCache = () => {
  senders.clear()
  clients.clear()
  closing = false
}

module.exports = {
  getSender,
  closeSender,
  closeSenders,
  clearCache
}
