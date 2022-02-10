const readline = require('readline')
const { Readable } = require('stream')

const transformBatch = require('./transform-batch')
const transformHeaders = require('./transform-headers')
const transformInvoiceLines = require('./transform-invoice-lines')
const invoiceToPaymentRequest = require('./payment-request')
const validate = require('./validate')

const { sendPaymentBatchMessage } = require('../messaging')

let sequence = ''
let batchHeaders = []
let paymentRequests = []

const checkAndTransformBatch = (batchHeaderLine) => {
  const batchHeader = transformBatch(batchHeaderLine)

  if (batchHeader.sequence === sequence) {
    batchHeaders.push(batchHeader)
    return true
  }

  return false
}

const parseBatchLineType = (batchLine) => {
  const lineType = batchLine[0]

  switch (lineType) {
    case 'B':
      checkAndTransformBatch(batchLine)
      return true
    case 'H':
      paymentRequests.push(transformHeaders(batchLine))
      return true
    case 'L':
      paymentRequests[paymentRequests.length - 1]
        .invoiceLines
        .push(transformInvoiceLines(batchLine))
      return true
    default:
      return false
  }
}

const reset = (batchId) => {
  sequence = batchId
  batchHeaders = []
  paymentRequests = []
}

const buildAndTransformParseFile = (fileBuffer) => {
  const invoiceInput = Readable.from(fileBuffer)
  const readBatchLines = readline.createInterface(invoiceInput)
  return new Promise((resolve, reject) => {
    readBatchLines.on('line', (line) => {
      const batchLine = line.split('^')
      !parseBatchLineType(batchLine) ??
        reject(new Error('Invalid file - Unknown line'))
    })

    readBatchLines.on('close', () => {
      validate(batchHeaders, paymentRequests, sequence)
        ? resolve(invoiceToPaymentRequest(paymentRequests))
        : reject(new Error('Invalid file'))
      readBatchLines.close()
      invoiceInput.destroy()
    })
  })
}

const parsePaymentFile = async (fileBuffer, batchId) => {
  reset(batchId)

  try {
    const paymentInvoice = await buildAndTransformParseFile(fileBuffer)
    await sendPaymentBatchMessage(paymentInvoice)
    return true
  } catch (err) {
    console.log(err)
  }

  return false
}

module.exports = parsePaymentFile
