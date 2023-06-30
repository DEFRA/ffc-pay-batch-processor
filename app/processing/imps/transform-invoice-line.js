const transformInvoiceLine = (lineData) => {
  return {
    value: !isNaN(lineData[4]) ? parseFloat(lineData[4]) : undefined,
    productCode: lineData[14],
    marketingYear: !isNaN(lineData[15]) ? parseInt(lineData[15]) : undefined,
    description: lineData[23],
    exchangeRate: !isNaN(lineData[10]) ? parseFloat(lineData[10]) : undefined,
    eventDate: lineData[17]
  }
}

module.exports = transformInvoiceLine
