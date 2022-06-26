const { convertToPence, getTotalValueInPence } = require('../../app/currency-convert')

describe('convert currency', () => {
  test('convertToPence converts 100 to pence', () => {
    const result = convertToPence(100)
    expect(result).toEqual(10000)
  })

  test('convertToPence converts 100 to pence with zero decimal', () => {
    const result = convertToPence(100.00)
    expect(result).toEqual(10000)
  })

  test('convertToPence converts -100 to pence', () => {
    const result = convertToPence(-100)
    expect(result).toEqual(-10000)
  })

  test('convertToPence converts 100.10 to pence', () => {
    const result = convertToPence(100.10)
    expect(result).toEqual(10010)
  })

  test('convertToPence converts 100.1 to pence', () => {
    const result = convertToPence(100.1)
    expect(result).toEqual(10010)
  })

  test('convertToPence converts 100 to pence if string', () => {
    const result = convertToPence('100')
    expect(result).toEqual(10000)
  })

  test('convertToPence converts 100 to pence if string with zero decimal', () => {
    const result = convertToPence('100.00')
    expect(result).toEqual(10000)
  })

  test('convertToPence converts 100.10 to pence if string', () => {
    const result = convertToPence('100.10')
    expect(result).toEqual(10010)
  })

  test('convertToPence converts 100.1 to pence if string', () => {
    const result = convertToPence('100.1')
    expect(result).toEqual(10010)
  })

  test('convertToPence returns undefined if no value', () => {
    const result = convertToPence()
    expect(result).toBeUndefined()
  })

  test('convertToPence returns undefined if undefined', () => {
    const result = convertToPence(undefined)
    expect(result).toBeUndefined()
  })

  test('convertToPence returns undefined if null', () => {
    const result = convertToPence(null)
    expect(result).toBeUndefined()
  })

  test('convertToPence returns undefined if object', () => {
    const result = convertToPence({})
    expect(result).toBeUndefined()
  })

  test('convertToPence returns undefined if array', () => {
    const result = convertToPence([])
    expect(result).toBeUndefined()
  })

  test('convertToPence returns undefined if true', () => {
    const result = convertToPence(true)
    expect(result).toBeUndefined()
  })

  test('convertToPence returns undefined if false', () => {
    const result = convertToPence(false)
    expect(result).toBeUndefined()
  })

  test('convertToPence returns undefined if boolean', () => {
    const result = convertToPence(Boolean())
    expect(result).toBeUndefined()
  })

  test('getTotalValueInPence calculates invoice total if integer single line', () => {
    const total = getTotalValueInPence([{ value: 100 }], 'value')
    expect(total).toBe(10000)
  })

  test('getTotalValueInPence calculates invoice total if integer multiple line', () => {
    const total = getTotalValueInPence([{ value: 100 }, { value: 100 }], 'value')
    expect(total).toBe(20000)
  })

  test('getTotalValueInPence calculates invoice total if zero pence', () => {
    const total = getTotalValueInPence([{ value: 100.00 }, { value: 100.00 }], 'value')
    expect(total).toBe(20000)
  })

  test('getTotalValueInPence calculates invoice total if 1 decimal place', () => {
    const total = getTotalValueInPence([{ value: 100.1 }, { value: 100.1 }], 'value')
    expect(total).toBe(20020)
  })

  test('getTotalValueInPence calculates invoice total if 2 decimal place', () => {
    const total = getTotalValueInPence([{ value: 100.10 }, { value: 100.20 }], 'value')
    expect(total).toBe(20030)
  })

  test('getTotalValueInPence calculates invoice total if only pence', () => {
    const total = getTotalValueInPence([{ value: 0.14 }, { value: 0.13 }], 'value')
    expect(total).toBe(27)
  })

  test('getTotalValueInPence calculates invoice total if only pence 1 decimal place', async () => {
    const total = getTotalValueInPence([{ value: 0.1 }, { value: 0.2 }], 'value')
    expect(total).toBe(30)
  })

  test('getTotalValueInPence calculates invoice total if only pence 2 decimal place', async () => {
    const total = getTotalValueInPence([{ value: 0.10 }, { value: 0.20 }], 'value')
    expect(total).toBe(30)
  })

  test('getTotalValueInPence returns undefined if no parameters', () => {
    const result = getTotalValueInPence()
    expect(result).toBeUndefined()
  })

  test('getTotalValueInPence returns undefined if undefined', () => {
    const result = getTotalValueInPence(undefined, 'value')
    expect(result).toBeUndefined()
  })

  test('getTotalValueInPence returns undefined if null', () => {
    const result = getTotalValueInPence(null, 'value')
    expect(result).toBeUndefined()
  })

  test('getTotalValueInPence returns undefined if object', () => {
    const result = getTotalValueInPence({}, 'value')
    expect(result).toBeUndefined()
  })

  test('getTotalValueInPence returns 0 if empty array', () => {
    const result = getTotalValueInPence([], 'value')
    expect(result).toBe(0)
  })

  test('getTotalValueInPence returns undefined if true', () => {
    const result = getTotalValueInPence(true, 'value')
    expect(result).toBeUndefined()
  })

  test('getTotalValueInPence returns undefined if false', () => {
    const result = getTotalValueInPence(false, 'value')
    expect(result).toBeUndefined()
  })

  test('getTotalValueInPence returns undefined if boolean', () => {
    const result = getTotalValueInPence(Boolean(), 'value')
    expect(result).toBeUndefined()
  })

  test('getTotalValueInPence calculates 0 if integer no match by property', () => {
    const total = getTotalValueInPence([{ value: 100 }, { value: 100 }], 'notValue')
    expect(total).toBe(0)
  })

  test('getTotalValueInPence calculates if only one object matches property', () => {
    const total = getTotalValueInPence([{ value: 100 }, { notValue: 100 }], 'value')
    expect(total).toBe(10000)
  })
})
