const correctInvalidDueDate = require('../../../../../app/processing/siti-agri/handle-known-defects/correct-invalid-due-dates')
const { sfi } = require('../../../../../app/schemes')
const invalidDueDates = require('../../../../../app/processing/siti-agri/handle-known-defects/correct-invalid-due-dates/invalid-due-dates')

describe('Correct invalid due date', () => {
  test.each(invalidDueDates, 'remaps every possible invalid due date to the correct date', (invalidDueDate) => {
    const paymentRequest = {
      sourceSystem: sfi.sourceSystem,
      dueDate: invalidDueDate.invalid
    }
    const updatedPaymentRequest = correctInvalidDueDate(paymentRequest)
    expect(updatedPaymentRequest.dueDate).toBe(invalidDueDate.correction)
  })

  test('does not correct due date if not on invalid list', () => {
    const paymentRequest = {
      sourceSystem: sfi.sourceSystem,
      dueDate: '2022-10-05'
    }
    const updatedPaymentRequest = correctInvalidDueDate(paymentRequest)
    expect(updatedPaymentRequest.dueDate).toBe('2022-10-05')
  })

  test.each(invalidDueDates, 'does not correct invalid due date if not SFI', (invalidDueDate) => {
    const paymentRequest = {
      sourceSystem: 'not SFI',
      dueDate: invalidDueDate.invalid
    }
    const updatedPaymentRequest = correctInvalidDueDate(paymentRequest)
    expect(updatedPaymentRequest.dueDate).toBe(invalidDueDate.invalid)
  })
})
