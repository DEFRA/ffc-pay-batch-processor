const { AP } = require('../../app/ledger')
const { sfiPilot } = require('../../app/schemes')

const batchHeader = {
  batchValue: 100,
  exportDate: '2022-06-28',
  ledger: AP,
  numberOfPaymentRequests: 1,
  sequence: 1,
  sourceSystem: sfiPilot.sourceSystem
}

module.exports = batchHeader
