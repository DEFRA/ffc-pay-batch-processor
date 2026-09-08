require('./insights').setup()
require('log-timestamp')

const { processingConfig } = require('./config')
const processing = require('./processing')
const { updateSchemesDatabase } = require('./update-schemes-database')

const { start: startServer } = require('./server')

const startApp = async () => {
  await startServer()
  await updateSchemesDatabase()
  if (processingConfig.processingActive) {
    await processing.start()
  } else {
    console.info('Processing capabilities are currently not enabled in this environment')
  }
}

(async () => {
  await startApp()
})()

module.exports = startApp
