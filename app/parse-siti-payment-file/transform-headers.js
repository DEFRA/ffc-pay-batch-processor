const transformHeaders = (headerData) => ({
  invoiceNumber: headerData[1],
  requestInvoiceNumber: headerData[2],
  claimId: headerData[3],
  paymentType: headerData[4],
  frn: headerData[5],
  currency: headerData[6],
  totalValue: parseFloat(headerData[7]),
  deliveryBodyCode: headerData[8],
  preferenceCurrency: headerData[9],
  creatorId: headerData[10],
  monthlyPaymentSchedule: headerData[11],
  lines: []
})

module.exports = transformHeaders
