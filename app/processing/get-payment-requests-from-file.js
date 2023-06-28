const readline = require('readline')
const { Readable } = require('stream')
const { fc } = require('../schemes')
const getPaymentRequestsFromSitiAgriFile = require('./siti-agri/get-payment-requests')
const getPaymentRequestsFromGlosFile = require('./glos/get-payment-requests')

const getPaymentRequestsFromFile = (fileBuffer, scheme, filename) => {
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  if (scheme.schemeId === fc) {
    return getPaymentRequestsFromGlosFile(readBatchLines, scheme, input, filename)
  }
  return getPaymentRequestsFromSitiAgriFile(readBatchLines, scheme, input, filename)
}

module.exports = getPaymentRequestsFromFile
