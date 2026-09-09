const { getSourceSystems } = require('ffc-pay-schemes')
const { AP } = require('../../app/constants/ledger')

const { SFI_PILOT } = getSourceSystems()

const batchHeader = {
  batchValue: 100,
  exportDate: '2022-06-28',
  ledger: AP,
  numberOfPaymentRequests: 1,
  sequence: 1,
  sourceSystem: SFI_PILOT
}

module.exports = batchHeader
