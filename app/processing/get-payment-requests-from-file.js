const readline = require('readline')
const { Readable } = require('stream')
const getPaymentRequestsFromSitiAgriFile = require('./siti-agri/get-payment-requests')

const getPaymentRequestsFromFile = (fileBuffer, scheme) => {
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return getPaymentRequestsFromSitiAgriFile(readBatchLines, scheme, input)
}

module.exports = getPaymentRequestsFromFile
