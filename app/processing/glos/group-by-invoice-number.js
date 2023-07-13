const groupByInvoiceNumber = (batchLines) => {
  return [...batchLines.reduce((x, y) => {
    const key = y.invoiceNumber

    // if key doesn't exist then first instance so create new group
    const item = x.get(key) || Object.assign({}, {
      correlationId: y.correlationId,
      batch: y.batch,
      invoiceNumber: y.invoiceNumber,
      paymentRequestNumber: y.paymentRequestNumber,
      frn: y.frn,
      sbi: y.sbi,
      claimDate: y.claimDate,
      invoiceLines: [{
        standardCode: y.standardCode,
        description: y.description,
        value: y.value
      }]
    })
    // if existing key found then add the invoice line details
    if (x.get(key)) {
      item.invoiceLines.push({
        standardCode: y.standardCode,
        description: y.description,
        value: y.value
      })
    }
    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = groupByInvoiceNumber
