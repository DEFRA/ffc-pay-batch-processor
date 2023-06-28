const transformBatch = require('./transform-batch')
const transformHeader = require('./transform-header')
const transformInvoiceLine = require('./transform-invoice-line')
const filterPaymentRequests = require('./filter-payment-requests')
const validateBatch = require('./validate-batch')

const readGlosFile = async (readBatchLines, scheme, input, filename) => {
  return new Promise((resolve, reject) => {
    const batch = createBatch()
    readBatchLines.on('line', (line) => {
      const batchLine = line.split('^')
      !readLine(batchLine, batch, scheme, filename) &&
        reject(new Error('Invalid file - Unknown line'))
    })

    readBatchLines.on('close', () => {
      validateBatch(batch.batchHeaders, batch.paymentRequests)
        ? resolve({ paymentRequestsCollection: filterPaymentRequests(batch.paymentRequests, scheme.sourceSystem), batchExportDate: batch.batchHeaders[0]?.exportDate })
        : reject(new Error('Invalid file'))
      readBatchLines.close()
      input.destroy()
    })
  })
}

const createBatch = () => {
  return {
    batchHeaders: [],
    paymentRequests: []
  }
}

const readLine = (batchLine, batch, scheme, filename) => {
  const lineType = batchLine[0]

  switch (lineType) {
    case 'B':
      batch.batchHeaders.push(transformBatch(batchLine))
      return true
    case 'H':
      batch.paymentRequests.push(transformHeader(batchLine, scheme.schemeId, filename))
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

module.exports = readGlosFile
