const transformInvoiceLines = (lineData) => ({
  invoiceNumber: lineData[1],
  value: parseFloat(lineData[2]),
  marketingYear: lineData[3],
  schemeCode: lineData[4],
  fundCode: lineData[5],
  agreementNumber: lineData[6],
  deliveryBody: lineData[7],
  convergence: lineData[8],
  lineId: lineData[9],
  description: lineData[10],
  dueDate: lineData[11],
  batchToCustomerDate: lineData[12],
  accountCode: lineData[13]
})

module.exports = transformInvoiceLines