const transformInvoiceLine = (lineData, schemeId) => {
  return [{
    invoiceNumber: lineData[1],
    companyCode: lineData[2],
    costCentre: lineData[3],
    objectiveCode: lineData[4],
    accountCode: lineData[5],
    subAccountCode: lineData[6],
    projectCode: lineData[7],
    value: !isNaN(lineData[8]) ? parseFloat(lineData[8]) : undefined,
    description: lineData[9]
  }, {
    invoiceNumber: lineData[1],
    companyCode: lineData[10],
    costCentre: lineData[11],
    objectiveCode: lineData[12],
    accountCode: lineData[13],
    subAccountCode: lineData[14],
    projectCode: lineData[15],
    value: !isNaN(lineData[16]) ? parseFloat(lineData[16]) : undefined,
    description: lineData[17]
  }]
}

module.exports = transformInvoiceLine
