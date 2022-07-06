const { sfi, sfiPilot, lumpSums } = require('../../schemes')

const transformInvoiceLine = (lineData, schemeId) => {
  switch (schemeId) {
    case sfi.schemeId:
    case sfiPilot.schemeId:
      return transformSFIInvoiceLine(lineData)
    case lumpSums.schemeId:
      return transformLumpSumsInvoiceLine(lineData)
    default:
      throw new Error(`Unknown scheme: ${schemeId}`)
  }
}

const transformSFIInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[1],
  value: !isNaN(lineData[2]) ? parseFloat(lineData[2]) : undefined,
  marketingYear: !isNaN(lineData[3]) ? parseInt(lineData[3]) : undefined,
  schemeCode: lineData[4],
  fundCode: lineData[5],
  agreementNumber: lineData[6],
  deliveryBody: lineData[7],
  description: lineData[10],
  dueDate: lineData[11],
  accountCode: lineData[13]
})

const transformLumpSumsInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[1],
  value: !isNaN(lineData[2]) ? parseFloat(lineData[2]) : undefined,
  marketingYear: !isNaN(lineData[3]) ? parseInt(lineData[3]) : undefined,
  schemeCode: lineData[4],
  fundCode: lineData[5],
  deliveryBody: lineData[6],
  description: lineData[8],
  dueDate: lineData[9]
})

module.exports = transformInvoiceLine
