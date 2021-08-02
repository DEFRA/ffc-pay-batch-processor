const fs = require('fs')
const readline = require('readline')

const transformBatch = require('./transform-batch')
const transformHeaders = require('./transform-headers')
const transformLines = require('./transform-lines')
const invoiceToPaymentRequest = require('./payment-request')
const validate = require('./validate')

const invoiceBatch = []
const invoiceHeaders = []

const parseInvoiceLineType = (invoiceLine) => {
  const invoiceLineType = invoiceLine[0]

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
  }
}

const parseFile = (fileBuffer) => {
  const invoiceInput = fs.createReadStream(fileBuffer)
  const readInvoiceLines = readline.createInterface(invoiceInput)

  return new Promise((resolve, reject) => {
    readInvoiceLines.on('line', (line) => {
      const splitInvoiceLines = line.split('^')
      parseInvoiceLineType(splitInvoiceLines)
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

module.exports = parseFile
