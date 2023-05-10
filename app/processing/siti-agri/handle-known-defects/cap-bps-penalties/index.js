const correctBPSPenalties = require('../cap-bps-penalties')
const { bps } = require('../../../../schemes')
const { P02, P04 } = require('../../../../constants/penalty-descriptions')

const capBPSPenalties = (paymentRequest) => {
  // DONE
  // setup tests first
  console.log('cap bps penalties')

  // check scheme is BPS
  if (paymentRequest.sourceSystem !== bps.sourceSystem) {
    return paymentRequest
  }
  // check if invoice lines contain P02/P04 penalty line
  // get all p02 and p04 lines
  const P02InvoiceLines = paymentRequest.invoiceLines.filter(invoiceLine => invoiceLine.description === P02)
  const P04InvoiceLines = paymentRequest.invoiceLines.filter(invoiceLine => invoiceLine.description === P04)

  if (!P02InvoiceLines.length && !P04InvoiceLines.length) {
    return paymentRequest
  }

  return correctBPSPenalties(paymentRequest)
}

module.exports = {
  capBPSPenalties
}
