const transformInvoiceLine = (lineData, schemeId) => {
  return {
    invoiceNumber: lineData[1],
    companyCodeEARFD: lineData[2],
    costCentreEARFD: lineData[3],
    objectiveCodeEARFD: lineData[4],
    accountCodeEARFD: lineData[5],
    subAccountCodeEARFD: lineData[6],
    projectCodeEARFD: lineData[7],
    valueEARFD: !isNaN(lineData[8]) ? parseFloat(lineData[8]) : undefined,
    descriptionEARFD: lineData[9],
    companyCodeDefra: lineData[10],
    costCentreDefra: lineData[11],
    objectiveCodeDefra: lineData[12],
    accountCodeDefra: lineData[13],
    subAccountCodeDefra: lineData[14],
    projectCodeDefra: lineData[15],
    valueDefra: !isNaN(lineData[16]) ? parseFloat(lineData[16]) : undefined,
    descriptionDefra: lineData[17],
    marketingYear: !isNaN(lineData[3]) ? parseInt(lineData[3]) : undefined,
    schemeCode: lineData[4],
    fundCode: lineData[5],
    agreementNumber: lineData[6],
    deliveryBody: lineData[7],
    description: lineData[10],
    dueDate: lineData[11],
    accountCode: lineData[13]
  }
}

module.exports = transformInvoiceLine
