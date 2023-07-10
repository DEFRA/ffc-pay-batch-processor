const { fc } = require('../../constants/schemes')
// const transformBatch = require('./transform-batch')
// const transformHeader = require('./transform-header')
// const transformInvoiceLine = require('./transform-invoice-line')
const filterPaymentRequests = require('./filter-payment-requests')
const validateBatch = require('./validate-batch')

const readGlosFile = async (readBatchLines, scheme, input, filename) => {
  return new Promise((resolve, reject) => {
    const batch = createBatch()
    const batchLines = []
    readBatchLines.on('line', (line) => {
      const batchLine = line.split(',')
      batchLines.push(transformLines(batchLine, filename))
      console.log(batchLines)
      /*
      !readLine(batchLine, batch, scheme, filename) &&
        reject(new Error('Invalid file - Unknown line'))
      */
    })

    readBatchLines.on('close', () => {
      groupByInvoiceNumber(batchLines)

      console.log(batchLines)

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

const transformLines = (batchLine, filename) => {
  return {
    sourceSystem: fc.sourceSystem,
    batch: filename,
    invoiceNumber: batchLine[7],
    paymentRequestNumber: 1,
    frn: batchLine[21],
    sbi: batchLine[24],
    claimDate: batchLine[23],
    standardCode: batchLine[12],
    description: batchLine[11],
    value: batchLine[8]
  }
}

const groupByInvoiceNumber = (batchLines) => {
  return [...batchLines.reduce((x, y) => {
    const key = y.invoiceNumber

    // if key doesn't exist then first instance so create new group
    const item = x.get(key) || Object.assign({}, {
      sourceSystem: y.sourceSystem,
      batch: y.batch,
      invoiceNumber: y.invoiceNumber,
      paymentRequestNumber: y.paymentRequestNumber,
      frn: y.frn,
      sbi: y.sbi,
      claimDate: y.claimDate,
      standardCode: y.standardCode,
      description: y.description,
      value: y.value
    })

    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = readGlosFile
