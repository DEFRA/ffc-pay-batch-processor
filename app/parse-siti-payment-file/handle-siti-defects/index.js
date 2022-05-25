const removeDefunctParticipationPayment = require('./remove-defunct-participation-fund')

const handleSitiDefects = (paymentRequest) => {
  return removeDefunctParticipationPayment(paymentRequest)
}

module.exports = handleSitiDefects
