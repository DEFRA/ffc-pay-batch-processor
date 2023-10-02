const removeDefunctParticipationPayment = require('./remove-defunct-participation-fund')
const { capBPSPenalties } = require('./cap-bps-penalties')
const { correctCSMarketingYear } = require('./correct-cs-marketing-year')
const { removeMoorlandPayment } = require('./remove-moorland-payment')

const handleKnownDefects = (paymentRequest) => {
  paymentRequest = removeDefunctParticipationPayment(paymentRequest)
  paymentRequest = capBPSPenalties(paymentRequest)
  paymentRequest = removeMoorlandPayment(paymentRequest)
  return correctCSMarketingYear(paymentRequest)
}

module.exports = handleKnownDefects
