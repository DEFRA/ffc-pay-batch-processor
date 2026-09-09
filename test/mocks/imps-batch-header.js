const { getSourceSystems } = require('ffc-pay-schemes')

const { IMPS } = getSourceSystems()

const batchHeader = {
  batchValue: 100,
  numberOfPaymentRequests: 1,
  sequence: 1,
  sourceSystem: IMPS
}

module.exports = batchHeader
