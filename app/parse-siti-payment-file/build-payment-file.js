const readline = require('readline')
const { Readable } = require('stream')

const transformBatch = require('./transform-batch')
const transformHeader = require('./transform-header')
const transformInvoiceLine = require('./transform-invoice-line')
const buildPaymentRequests = require('./build-payment-requests')
const validate = require('./validate')

const buildAndTransformParseFile = (fileBuffer, schemeType) => {
  const batch = createBatch(schemeType.batchId)
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return new Promise((resolve, reject) => {
    readBatchLines.on('line', (line) => {
      const batchLine = line.split('^')
      !parseBatchLineType(batchLine, batch, schemeType.scheme) &&
        reject(new Error('Invalid file - Unknown line'))
    })

    readBatchLines.on('close', () => {
      const batchHeaders = batch.batchHeaders
      const paymentRequests = batch.paymentRequests
      const batchSequence = batch.sequence
      const batchExportDate = batchHeaders?.length ? batchHeaders[0].exportDate : null

      validate(batchHeaders, paymentRequests, batchSequence)
        ? resolve({
            paymentRequests: buildPaymentRequests(paymentRequests),
            batchExportDate
          })
        : reject(new Error('Invalid file'))
      readBatchLines.close()
      input.destroy()
    })
  })
}

const createBatch = (sequence) => {
  return {
    sequence,
    batchHeaders: [],
    paymentRequests: []
  }
}

const parseBatchLineType = (batchLine, batch, scheme) => {
  const lineType = batchLine[0]

  switch (lineType) {
    case 'B':
      batch.batchHeaders.push(transformBatch(batchLine))
      return true
    case 'H':
      batch.paymentRequests.push(transformHeader(batchLine, scheme))
      return true
    case 'L':
      batch.paymentRequests[batch.paymentRequests.length - 1]
        .invoiceLines
        .push(transformInvoiceLine(batchLine, scheme))
      return true
    default:
      return false
  }
}

module.exports = {
  buildAndTransformParseFile
}
