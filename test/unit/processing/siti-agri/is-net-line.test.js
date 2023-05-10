const { isNetLine } = require('../../../../app/processing/siti-agri/is-net-line')

describe('is net line', () => {
  test('should return true if line description starts with N00', () => {
    const invoiceLine = { description: 'N00 - Net value' }
    expect(isNetLine(invoiceLine)).toBe(true)
  })

  test('should return false if line description does not start with N00', () => {
    const invoiceLine = { description: 'G00 - Gross value' }
    expect(isNetLine(invoiceLine)).toBe(false)
  })
})
