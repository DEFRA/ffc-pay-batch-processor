const readline = require('readline')
const { Readable } = require('stream')

const transformBatch = require('./transform-batch')
const transformHeaders = require('./transform-headers')
const transformInvoiceLines = require('./transform-invoice-lines')
const invoiceToPaymentRequest = require('./payment-request')
const validate = require('./validate')

const { sendPaymentBatchMessage } = require('../messaging')

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

const buildAndTransformParseFile = (fileBuffer, batch) => {
  const input = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(input)
  return new Promise((resolve, reject) => {
    readBatchLines.on('line', (line) => {
      const batchLine = line.split('^')
      !parseBatchLineType(batchLine, batch) ??
        reject(new Error('Invalid file - Unknown line'))
    })

    readBatchLines.on('close', () => {
      validate(batch.batchHeaders, batch.paymentRequests, batch.sequence)
        ? resolve(invoiceToPaymentRequest(batch.paymentRequests))
        : reject(new Error('Invalid file'))
      readBatchLines.close()
      input.destroy()
    })
  })
}

const parsePaymentFile = async (fileBuffer, sequence) => {
  const batch = createBatch(sequence)

  try {
    const paymentRequests = await buildAndTransformParseFile(fileBuffer, batch)
    await sendPaymentBatchMessage(paymentRequests)
    return true
  } catch (err) {
    console.log(err)
  }

  return false
}

module.exports = parsePaymentFile
