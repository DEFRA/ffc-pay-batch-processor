const processingConfig = require('../config/processing')
const pollInbound = require('./poll-inbound')

const start = async () => {
  await pollInbound()
  setTimeout(start, processingConfig.pollingInterval)
}

module.exports = {
  start
}
