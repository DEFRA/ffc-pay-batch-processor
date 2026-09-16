const { getSourceSystems } = require('ffc-pay-schemes')

const { ES } = getSourceSystems()

const batchHeader = {
  batchValue: 100,
  exportDate: '28/06/2022',
  numberOfPaymentRequests: 1,
  sequence: 1,
  sourceSystem: ES
}

module.exports = batchHeader
