const transformInvoiceLine = (lineData) => {
  return {
    invoiceNumber: lineData[3],
    value: !isNaN(lineData[4]) ? parseFloat(lineData[4]) : undefined,
    productCode: lineData[14],
    marketingYear: !isNaN(lineData[15]) ? parseInt(lineData[15]) : undefined,
    description: lineData[22],
    exchangeRate: lineData[10] || undefined,
    eventDate: lineData[17] || undefined
  }
}

module.exports = transformInvoiceLine
