const readline = require('readline')
const { Readable } = require('stream')

const transformBatch = require('./transform-batch')
const transformHeaders = require('./transform-headers')
const transformLines = require('./transform-lines')
const invoiceToPaymentRequest = require('./payment-request')
const validate = require('./validate')

const { sendPaymentBatchMessage } = require('../messaging')

const invoiceBatch = []
const invoiceHeaders = []

const parseInvoiceLineType = (invoiceLine) => {
  const invoiceLineType = invoiceLine[0]
  let validLine = true

  switch (invoiceLineType) {
    case 'B':
      invoiceBatch.push(transformBatch(invoiceLine))
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
      validate(invoiceBatch, invoiceHeaders)
        ? resolve(invoiceToPaymentRequest(invoiceHeaders))
        : reject(new Error('Invalid file'))
      readInvoiceLines.close()
      invoiceInput.destroy()
    })
  })
}

const parseFile = async (fileBuffer) => {
  const paymentInvoice = await buildAndTransformParseFile(fileBuffer)
  for (const paymentRequest of paymentInvoice) {
    await sendPaymentBatchMessage(paymentRequest)
  }
}

module.exports = parseFile
