const fs = require('fs')
const readline = require('readline')

const checkInvoiceTotal = require('./invoice-totals')
const transformBatch = require('./transform-batch')
const transformHeaders = require('./transform-headers')
const transformLines = require('./transform-lines')
const invoiceToPaymentRequest = require('./payment-request')

const invoiceBatch = []
const invoiceHeaders = []

const parseInvoiceType = (invoiceLine) => {
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

const validate = () => {
  const numberOfInvoicesValid = invoiceBatch[0].numberOfInvoices === invoiceHeaders.length
  const invoiceTotalsValid = invoiceBatch[0].batchValue === checkInvoiceTotal(invoiceHeaders, 'totalValue')
  const invoiceLinesTotalsValid = invoiceHeaders.filter(a => a.lineTotalsValid).length === 0 ?? false

  return numberOfInvoicesValid && invoiceTotalsValid && invoiceLinesTotalsValid
}

const parseFile = (fileBuffer) => {
  const invoiceInput = fs.createReadStream(fileBuffer)
  const readInvoiceLines = readline.createInterface(invoiceInput)

  return new Promise((resolve, reject) => {
    readInvoiceLines.on('line', (line) => {
      const splitInvoiceLines = line.split('^')
      parseInvoiceType(splitInvoiceLines)
    })

    readInvoiceLines.on('close', () => {
      validate() ? resolve(invoiceToPaymentRequest(invoiceHeaders)) : reject(new Error('Invalid file'))
      readInvoiceLines.close()
      invoiceInput.destroy()
    })
  })
}

module.exports = parseFile
