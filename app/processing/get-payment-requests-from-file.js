const readline = require('readline')
const { Readable } = require('stream')
const getPaymentRequestsFromSitiAgriFile = require('./siti-agri/get-payment-requests')

const getPaymentRequestsFromFile = (fileBuffer, scheme, filename) => {
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return getPaymentRequestsFromSitiAgriFile(readBatchLines, scheme, input, filename)
}

module.exports = getPaymentRequestsFromFile
