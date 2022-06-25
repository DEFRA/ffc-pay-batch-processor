const readline = require('readline')
const { Readable } = require('stream')
const readSitiAgriFile = require('./siti-agri/read-siti-agri-file')

const getPaymentRequests = (fileBuffer, scheme) => {
  const batch = createBatch()
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return readSitiAgriFile(readBatchLines, batch, scheme, input)
}

const createBatch = () => {
  return {
    batchHeaders: [],
    paymentRequests: []
  }
}

module.exports = getPaymentRequests
