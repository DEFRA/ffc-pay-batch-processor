const removeDefunctParticipationPayment = require('./remove-defunct-participation-fund')
const { capBPSPenalties } = require('./cap-bps-penalties')
const { correctCSMarketingYear } = require('./correct-cs-marketing-year')
const correctInvalidDueDate = require('./correct-invalid-due-dates')

const handleKnownDefects = (paymentRequest) => {
  paymentRequest = removeDefunctParticipationPayment(paymentRequest)
  paymentRequest = capBPSPenalties(paymentRequest)
  paymentRequest = correctCSMarketingYear(paymentRequest)
  return correctInvalidDueDate(paymentRequest)
}

module.exports = handleKnownDefects
