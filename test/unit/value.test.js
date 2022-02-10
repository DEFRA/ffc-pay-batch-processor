const getValueInPence = require('../../app/parse-siti-payment-file/value')

describe('get invoice total', () => {
  test('calculates invoice total if integer single line', () => {
    const total = getValueInPence([{ value: 100 }], 'value')
    expect(total).toBe(10000)
  })

  test('calculates invoice total if integer multiple line', () => {
    const total = getValueInPence([{ value: 100 }, { value: 100 }], 'value')
    expect(total).toBe(20000)
  })

  test('calculates invoice total if zero pence', () => {
    const total = getValueInPence([{ value: 100.00 }, { value: 100.00 }], 'value')
    expect(total).toBe(20000)
  })

  test('calculates invoice total if 1 decimal place', () => {
    const total = getValueInPence([{ value: 100.1 }, { value: 100.1 }], 'value')
    expect(total).toBe(20020)
  })

  test('calculates invoice total if 2 decimal place', () => {
    const total = getValueInPence([{ value: 100.10 }, { value: 100.20 }], 'value')
    expect(total).toBe(20030)
  })

  test('calculates invoice total if only pence', () => {
    const total = getValueInPence([{ value: 0.14 }, { value: 0.13 }], 'value')
    expect(total).toBe(27)
  })

  test('calculates invoice total if only pence 1 decimal place', async () => {
    const total = getValueInPence([{ value: 0.1 }, { value: 0.2 }], 'value')
    expect(total).toBe(30)
  })

  test('calculates invoice total if only pence 2 decimal place', async () => {
    const total = getValueInPence([{ value: 0.10 }, { value: 0.20 }], 'value')
    expect(total).toBe(30)
  })
})
