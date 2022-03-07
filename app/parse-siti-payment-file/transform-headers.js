const transformHeaders = (headerData) => ({
  invoiceNumber: headerData[1],
  paymentRequestNumber: parseInt(headerData[2]),
  contractNumber: headerData[3],
  paymentType: headerData[4],
  frn: headerData[5],
  currency: headerData[6],
  value: parseFloat(headerData[7]),
  deliveryBody: headerData[8],
  preferenceCurrency: headerData[9],
  sourceSystem: headerData[10],
  schedule: headerData[11],
  invoiceLines: []
})

module.exports = transformHeaders
