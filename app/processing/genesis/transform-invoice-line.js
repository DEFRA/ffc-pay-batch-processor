const transformInvoiceLine = (lineData) => {
  return [{
    companyCode: lineData[2],
    costCentre: lineData[3],
    standardCode: lineData[4],
    accountCode: lineData[5],
    subAccountCode: lineData[6],
    projectCode: lineData[7].length > 0 ? lineData[7] : undefined,
    value: !isNaN(lineData[8]) ? parseFloat(lineData[8]) : undefined,
    description: lineData[9]
  }, {
    companyCode: lineData[10],
    costCentre: lineData[11],
    standardCode: lineData[12],
    accountCode: lineData[13],
    subAccountCode: lineData[14],
    projectCode: lineData[15].length > 0 ? lineData[15] : undefined,
    value: !isNaN(lineData[16]) ? parseFloat(lineData[16]) : undefined,
    description: lineData[17]
  }]
}

module.exports = transformInvoiceLine
