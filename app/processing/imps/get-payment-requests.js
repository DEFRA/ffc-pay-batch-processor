const transformBatch = require('./transform-batch')
const transformHeader = require('./transform-header')
const transformInvoiceLine = require('./transform-invoice-line')
const filterPaymentRequests = require('./filter-payment-requests')
const validateBatch = require('./validate-batch')

const getPaymentRequestsFromImpsFile = async (readBatchLines, scheme, input, filename) => {
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
    case 'H':
      batch.batchHeaders.push(transformBatch(batchLine))
      return true
    case 'I':
      batch.paymentRequests.push(transformHeader(batchLine, filename))
      return true
    case 'D': {
      const invoiceLines = transformInvoiceLine(batchLine)
      for (const invoiceLine of invoiceLines) {
        if (invoiceLine.value) {
          batch.paymentRequests[batch.paymentRequests.length - 1]
            .invoiceLines
            .push(invoiceLine)
        }
      }
      return true
    }
    case 'T':
      return true
    default:
      return false
  }
}

module.exports = {
  getPaymentRequestsFromImpsFile
}
