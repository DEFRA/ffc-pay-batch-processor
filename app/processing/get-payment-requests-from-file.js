const readline = require('readline')
const { Readable } = require('stream')
const getPaymentRequestsFromSitiAgriFile = require('./siti-agri/get-payment-requests')

const getPaymentRequestsFromFile = (fileBuffer, scheme) => {
  const batch = createBatch()
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return getPaymentRequestsFromSitiAgriFile(readBatchLines, batch, scheme, input)
}

const createBatch = () => {
  return {
    batchHeaders: [],
    paymentRequests: []
  }
}

module.exports = getPaymentRequestsFromFile
