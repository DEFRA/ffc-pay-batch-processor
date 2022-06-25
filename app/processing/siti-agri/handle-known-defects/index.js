const removeDefunctParticipationPayment = require('./remove-defunct-participation-fund')

const handleKnownDefects = (paymentRequest) => {
  return removeDefunctParticipationPayment(paymentRequest)
}

module.exports = handleKnownDefects
