const { es } = require('../../app/constants/schemes')

const batchHeader = {
  batchValue: 100,
  exportDate: '28/06/2022',
  numberOfPaymentRequests: 1,
  sequence: 1,
  sourceSystem: es.sourceSystem
}

module.exports = batchHeader
