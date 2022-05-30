const readline = require('readline')
const { Readable } = require('stream')

const transformBatch = require('./transform-batch')
const transformHeaders = require('./transform-headers')
const transformInvoiceLines = require('./transform-invoice-lines')
const buildPaymentRequests = require('./build-payment-requests')
const validate = require('./validate')

const parseBatchLineType = (batchLine, batch) => {
  const lineType = batchLine[0]

  switch (lineType) {
    case 'B':
      batch.batchHeaders.push(transformBatch(batchLine))
      return true
    case 'H':
      batch.paymentRequests.push(transformHeaders(batchLine))
      return true
    case 'L':
      batch.paymentRequests[batch.paymentRequests.length - 1]
        .invoiceLines
        .push(transformInvoiceLines(batchLine))
      return true
    default:
      return false
  }
}

const createBatch = (sequence) => {
  return {
    sequence,
    batchHeaders: [],
    paymentRequests: []
  }
}

const buildAndTransformParseFile = (fileBuffer, sequence) => {
  const batch = createBatch(sequence)
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return new Promise((resolve, reject) => {
    readBatchLines.on('line', (line) => {
      const batchLine = line.split('^')
      !parseBatchLineType(batchLine, batch) &&
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

module.exports = {
  buildAndTransformParseFile
}
