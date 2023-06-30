const transformInvoiceLine = (lineData) => {
  return {
    companyCode: lineData[2],
    costCentre: lineData[3],
    standardCode: lineData[4],
    accountCode: lineData[5],
    subAccountCode: lineData[6],
    projectCode: lineData[7].length > 0 ? lineData[7] : undefined,
    value: !isNaN(lineData[8]) ? parseFloat(lineData[8]) : undefined,
    description: lineData[9]
  }
}

module.exports = transformInvoiceLine
