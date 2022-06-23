const { SFI, SFI_PILOT, LUMP_SUMS } = require('../schemes')

const transformInvoiceLine = (lineData, scheme) => {
  switch (scheme) {
    case SFI:
    case SFI_PILOT:
      return transformSFIInvoiceLine(lineData)
    case LUMP_SUMS:
      return transformLumpSumsInvoiceLine(lineData)
    default:
      throw new Error('Unknown scheme')
  }
}

const transformSFIInvoiceLine = (lineData) => ({
  invoiceNumber: lineData[1],
  value: parseFloat(lineData[2]),
  marketingYear: lineData[3],
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
  value: parseFloat(lineData[2]),
  marketingYear: lineData[3],
  schemeCode: lineData[4],
  fundCode: lineData[5],
  deliveryBody: lineData[6],
  description: lineData[8],
  dueDate: lineData[9]
})

module.exports = transformInvoiceLine
