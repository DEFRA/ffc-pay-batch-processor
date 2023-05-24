const { cs } = require('../../../schemes')

const correctCSMarketingYear = (paymentRequest) => {
  if (paymentRequest.sourceSystem !== cs.sourceSystem) {
    return paymentRequest
  }
  // Some CS payment requests only have a two digit marketing year.
  // CS started in 2016, so for any two digit year from 16 onwards, we need to prefix with 20
  if (!paymentRequest.marketingYear || paymentRequest.marketingYear <= 16 || paymentRequest.marketingYear?.toString().length === 4) {
    return paymentRequest
  }
  paymentRequest.marketingYear = parseInt(`20${paymentRequest.marketingYear}`)
  return paymentRequest
}

module.exports = {
  correctCSMarketingYear
}
