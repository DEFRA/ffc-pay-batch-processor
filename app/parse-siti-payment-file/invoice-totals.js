const getInvoiceTotal = (data, key) => {
  return data.reduce((a, b) => { return a + b[key] }, 0)
}

module.exports = getInvoiceTotal
