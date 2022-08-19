const { sfi } = require('../../../schemes')

const correctInvalidDueDate = (paymentRequest) => {
  if (paymentRequest.sourceSystem !== sfi.sourceSystem) {
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

const invalidDueDates = [{
  invalid: '2022-07-01',
  correction: '2022-10-05'
}, {
  invalid: '2022-08-01',
  correction: '2022-11-05'
}, {
  invalid: '2022-09-01',
  correction: '2022-12-05'
}, {
  invalid: '2022-10-01',
  correction: '2023-01-05'
}, {
  invalid: '2022-11-01',
  correction: '2023-02-05'
}, {
  invalid: '2022-12-01',
  correction: '2023-03-05'
}, {
  invalid: '2023-01-01',
  correction: '2023-04-05'
}, {
  invalid: '2023-02-01',
  correction: '2023-05-05'
}, {
  invalid: '2023-03-01',
  correction: '2023-06-05'
}]

module.exports = correctInvalidDueDate
