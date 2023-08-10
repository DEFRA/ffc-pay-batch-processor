const { sfi, sfiPilot, lumpSums, bps, cs, fdmr, sfi23 } = require('../../constants/schemes')

const transformInvoiceLine = (lineData, schemeId) => {
  switch (schemeId) {
    case sfi.schemeId:
    case sfiPilot.schemeId:
    case sfi23.schemeId:
      return transformSFIInvoiceLine(lineData)
    case lumpSums.schemeId:
    case bps.schemeId:
    case fdmr.schemeId:
      return transformSitiInvoiceLine(lineData)
    case cs.schemeId:
      return transformCSInvoiceLine(lineData)
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

const transformSitiInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[1],
  value: !isNaN(lineData[2]) ? parseFloat(lineData[2]) : undefined,
  marketingYear: !isNaN(lineData[3]) ? parseInt(lineData[3]) : undefined,
  schemeCode: lineData[4],
  fundCode: lineData[5],
  deliveryBody: lineData[6],
  description: lineData[8],
  dueDate: lineData[9]
})

const transformCSInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[1],
  value: !isNaN(lineData[2]) ? parseFloat(lineData[2]) : undefined,
  marketingYear: !isNaN(lineData[3]) ? parseInt(lineData[3]) : undefined,
  schemeCode: lineData[4],
  fundCode: lineData[5],
  agreementNumber: lineData[6],
  deliveryBody: lineData[7],
  convergence: lineData[8] === 'Y',
  description: lineData[10],
  dueDate: lineData[11],
  accountCode: lineData[12]
})

module.exports = transformInvoiceLine
