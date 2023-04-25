const { sfi } = require('../../../../schemes')
const invalidDueDates = require('./invalid-due-dates')
const config = require('../../../../config/processing')

const correctInvalidDueDate = (paymentRequest) => {
  if (paymentRequest.sourceSystem !== sfi.sourceSystem || !config.handleDueDateDefect) {
    return paymentRequest
  }
  // Defect in Siti Agri where due date is output as agreement live date rather than date first quarter payment is due
  // If due date matches known invalid date, then we need to update it to be the correction date
  const invalidDueDate = invalidDueDates.find(x => x.invalid === paymentRequest.dueDate)
  if (invalidDueDate) {
    paymentRequest.dueDate = invalidDueDate.correction
  }
  return paymentRequest
}

module.exports = correctInvalidDueDate
