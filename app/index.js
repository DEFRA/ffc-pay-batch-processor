require('./insights').setup()
require('log-timestamp')

const processingConfig = require('./config/processing')
const processing = require('./processing')

const startApp = async () => {
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
