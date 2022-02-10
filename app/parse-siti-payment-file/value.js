const { convertToPence } = require('../currency-convert')

const getValueInPence = (data, key) => {
  return data.reduce((a, b) => { return a + convertToPence(b[key]) }, 0)
}

module.exports = getValueInPence
