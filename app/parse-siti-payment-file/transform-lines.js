const transformLines = (lineData) => ({
  invoiceNumber: lineData[1],
  value: parseFloat(lineData[2]),
  marketingYear: lineData[3],
  schemeCode: lineData[4],
  fund: lineData[5],
  agreementNumber: lineData[6],
  deliveryBody: lineData[7],
  lineId: lineData[8],
  lineDescription: lineData[9],
  dueDate: lineData[10],
  batchToCustomerDate: lineData[11],
  msdaxAccountCode: lineData[12]
})

module.exports = transformLines
