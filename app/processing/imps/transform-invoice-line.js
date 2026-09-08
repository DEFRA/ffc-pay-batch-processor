const transformInvoiceLine = (lineData) => {
  return {
    invoiceNumber: lineData[3],
    value: !Number.isNaN(lineData[4]) ? Number.parseFloat(lineData[4]) : undefined,
    productCode: lineData[14],
    marketingYear: !Number.isNaN(lineData[15]) ? Number.parseInt(lineData[15]) : undefined,
    description: lineData[22],
    exchangeRate: lineData[10] || undefined,
    eventDate: lineData[17] || undefined
  }
}

module.exports = transformInvoiceLine
