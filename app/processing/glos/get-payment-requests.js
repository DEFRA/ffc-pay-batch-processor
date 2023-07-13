const filterPaymentRequests = require('./filter-payment-requests')
// const validateBatch = require('./validate-batch')

const readGlosFile = async (readBatchLines, scheme, input, filename) => {
  return new Promise((resolve, reject) => {
    const batch = createBatch()
    const batchLines = []
    readBatchLines.on('line', (line) => {
      const batchLine = line.split(',')
      !batchLines.push(transformLines(batchLine, filename, scheme)) &&
        reject(new Error('Invalid file - Unknown line'))
    })

    readBatchLines.on('close', () => {
      const paymentRequests = groupByInvoiceNumber(batchLines)
      paymentRequests
        ? resolve({ paymentRequestsCollection: filterPaymentRequests(paymentRequests, scheme.sourceSystem), batchExportDate: batch.batchHeaders[0]?.exportDate })
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

const transformLines = (batchLine, filename, scheme) => {
  return {
    sourceSystem: scheme.sourceSystem,
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
      invoiceLines: [{
        standardCode: y.standardCode,
        description: y.description,
        value: y.value
      }]
    })
    // if existing key found then add the invoice line details
    if (x.get(key)) {
      item.invoiceLines.push({
        standardCode: y.standardCode,
        description: y.description,
        value: y.value
      })
    }
    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = readGlosFile
