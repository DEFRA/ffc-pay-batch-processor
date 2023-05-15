const { capBPSPenalties } = require('./cap-bps-penalties')
const correctInvalidDueDate = require('./correct-invalid-due-dates')
const removeDefunctParticipationPayment = require('./remove-defunct-participation-fund')

const handleKnownDefects = (paymentRequest) => {
  paymentRequest = removeDefunctParticipationPayment(paymentRequest)
  paymentRequest = capBPSPenalties(paymentRequest)
  return correctInvalidDueDate(paymentRequest)
}

module.exports = handleKnownDefects
