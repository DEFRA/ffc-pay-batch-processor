const correctInvalidDueDate = require('./correct-invalid-due-date')
const removeDefunctParticipationPayment = require('./remove-defunct-participation-fund')

const handleKnownDefects = (paymentRequest) => {
  paymentRequest = removeDefunctParticipationPayment(paymentRequest)
  return correctInvalidDueDate(paymentRequest)
}

module.exports = handleKnownDefects
