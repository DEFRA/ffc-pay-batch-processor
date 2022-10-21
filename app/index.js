require('./insights').setup()
require('log-timestamp')
const processing = require('./processing')
const storage = require('./storage')

module.exports = (async () => {
  storage.connect()
  await processing.start()
})()
