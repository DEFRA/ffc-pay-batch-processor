const readline = require('readline')
const { Readable } = require('stream')

const transformBatch = require('./transform-batch')
const transformHeaders = require('./transform-headers')
const transformLines = require('./transform-lines')
const invoiceToPaymentRequest = require('./payment-request')
const validate = require('./validate')

const { sendPaymentBatchMessage } = require('../messaging')

let invoiceBatchId = ''
let invoiceBatch = []
let invoiceHeaders = []

const checkAndTransformBatch = (invoiceLine) => {
  const batch = transformBatch(invoiceLine)

  if (batch.batchId === invoiceBatchId) {
    invoiceBatch.push(batch)
    return true
  }

  return false
}

const parseInvoiceLineType = (invoiceLine, id) => {
  const invoiceLineType = invoiceLine[0]
  let validLine = true

  switch (invoiceLineType) {
    case 'B':
      checkAndTransformBatch(invoiceLine)
      break
    case 'H':
      invoiceHeaders.push(transformHeaders(invoiceLine))
      break
    case 'L':
      invoiceHeaders[invoiceHeaders.length - 1]
        .lines
        .push(transformLines(invoiceLine))
      break
    default:
      validLine = false
      break
  }

  return validLine
}

const reset = (batchId) => {
  invoiceBatchId = batchId
  invoiceBatch = []
  invoiceHeaders = []
}

const buildAndTransformParseFile = (fileBuffer) => {
  const invoiceInput = Readable.from(fileBuffer)
  const readInvoiceLines = readline.createInterface(invoiceInput)
  return new Promise((resolve, reject) => {
    readInvoiceLines.on('line', (line) => {
      const splitInvoiceLines = line.split('^')
      !parseInvoiceLineType(splitInvoiceLines) ??
        reject(new Error('Invalid file - Unknown line'))
    })

    readInvoiceLines.on('close', () => {
      validate(invoiceBatch, invoiceHeaders, invoiceBatchId)
        ? resolve(invoiceToPaymentRequest(invoiceHeaders))
        : reject(new Error('Invalid file'))
      readInvoiceLines.close()
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
