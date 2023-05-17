const { P02, P04 } = require('../../../../constants/line-descriptions')
const { recalculateBPSPenalties } = require('../cap-bps-penalties/recalculate-bps-penalties')
const { bps } = require('../../../../schemes')

const capBPSPenalties = (paymentRequest) => {
  const penaltyInvoiceLines = paymentRequest.invoiceLines.filter(invoiceLine => invoiceLine?.description.startsWith(P02) || invoiceLine?.description.startsWith(P04))

  if (paymentRequest.sourceSystem !== bps.sourceSystem || penaltyInvoiceLines.length === 0) {
    return paymentRequest
  }
  return recalculateBPSPenalties(paymentRequest)
}

module.exports = {
  capBPSPenalties
}
