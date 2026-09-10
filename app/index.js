require('./insights').setup()
require('log-timestamp')

const { processingConfig } = require('./config')
const processing = require('./processing')

const { start: startServer } = require('./server')
const { closeSenders } = require('./messaging/service-bus/sender-cache')

const startApp = async () => {
  await startServer()
  if (processingConfig.processingActive) {
    await processing.start()
  } else {
    console.info('Processing capabilities are currently not enabled in this environment')
  }
}

const handleShutdown = async (signal) => {
  console.info(`Received ${signal}, closing messaging connections`)
  await closeSenders()
  process.exit(0)
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'))
process.on('SIGINT', () => handleShutdown('SIGINT'))

startApp()

module.exports = startApp
