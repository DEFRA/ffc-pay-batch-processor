const { randomUUID } = require('node:crypto')

const transformLine = (batchLine, schemeId, filename) => {
  return {
    correlationId: randomUUID(),
    batch: filename,
    schemeId,
    batchExportDate: batchLine[3],
    invoiceNumber: batchLine[7],
    paymentRequestNumber: 1,
    frn: batchLine[21],
    sbi: batchLine[24],
    claimDate: batchLine[23],
    standardCode: batchLine[12],
    description: batchLine[11],
    value: !isNaN(batchLine[8]) ? parseFloat(batchLine[8]) : undefined
  }
}

module.exports = transformLine
