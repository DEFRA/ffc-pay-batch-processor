const { imps } = require('../../app/constants/schemes')

const batchHeader = {
  batchValue: 100,
  numberOfPaymentRequests: 1,
  sequence: 1,
  sourceSystem: imps.sourceSystem
}

module.exports = batchHeader
