const { convertToPence } = require('../currency-convert')

const getInvoiceTotalInPence = (data, key) => {
  return data.reduce((a, b) => { return a + convertToPence(b[key]) }, 0)
}

module.exports = getInvoiceTotalInPence
