const transformLines = require('./transform-lines')
const groupByInvoiceNumber = require('./group-by-invoice-number')
const filterPaymentRequests = require('./filter-payment-requests')

const readGlosFile = async (readBatchLines, scheme, input, filename) => {
  return new Promise((resolve, reject) => {
    const batchLines = []
    readBatchLines.on('line', (line) => {
      const batchLine = line.split(',')
      !readLine(batchLines, batchLine, filename) &&
        reject(new Error('Invalid file - Unknown line'))
    })

    readBatchLines.on('close', () => {
      const paymentRequests = groupByInvoiceNumber(batchLines)
      paymentRequests
        ? resolve({ paymentRequestsCollection: filterPaymentRequests(paymentRequests, scheme.sourceSystem), batchExportDate: paymentRequests[0]?.batchExportDate })
        : reject(new Error('Invalid file'))
      readBatchLines.close()
      input.destroy()
    })
  })
}

const readLine = (batchLines, batchLine, filename) => {
  if (batchLine) {
    batchLines.push(transformLines(batchLine, filename))
    return true
  } else {
    return false
  }
}

module.exports = readGlosFile
