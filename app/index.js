require('./insights').setup()
require('log-timestamp')
const processing = require('./processing')

module.exports = (async function startService () {
  await processing.start()
}())
