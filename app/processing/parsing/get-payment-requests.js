const readline = require('readline')
const { Readable } = require('stream')

const transformBatch = require('./transform-batch')
const transformHeader = require('./transform-header')
const transformInvoiceLine = require('./transform-invoice-line')
const buildPaymentRequests = require('./build-payment-requests')
const validateBatch = require('./validate-batch')

const getPaymentRequests = (fileBuffer, scheme) => {
  const batch = createBatch()
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return readPaymentRequestsFromFile(readBatchLines, batch, scheme, input)
}

const createBatch = () => {
  return {
    batchHeaders: [],
    paymentRequests: []
  }
}

const readPaymentRequestsFromFile = async (readBatchLines, batch, scheme, input) => {
  return new Promise((resolve, reject) => {
    readBatchLines.on('line', (line) => {
      const batchLine = line.split('^')
      !readLine(batchLine, batch, scheme) &&
        reject(new Error('Invalid file - Unknown line'))
    })

    readBatchLines.on('close', () => {
      validateBatch(batch.batchHeaders, batch.paymentRequests)
        ? resolve({ paymentRequests: buildPaymentRequests(batch.paymentRequests, scheme.sourceSystem), batchExportDate: batch.batchHeaders[0]?.exportDate })
        : reject(new Error('Invalid file'))
      readBatchLines.close()
      input.destroy()
    })
  })
}

const readLine = (batchLine, batch, scheme) => {
  const lineType = batchLine[0]

  switch (lineType) {
    case 'B':
      batch.batchHeaders.push(transformBatch(batchLine))
      return true
    case 'H':
      batch.paymentRequests.push(transformHeader(batchLine, scheme.schemeId))
      return true
    case 'L':
      batch.paymentRequests[batch.paymentRequests.length - 1]
        .invoiceLines
        .push(transformInvoiceLine(batchLine, scheme.schemeId))
      return true
    default:
      return false
  }
}

module.exports = getPaymentRequests
