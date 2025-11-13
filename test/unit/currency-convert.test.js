const { convertToPence, getTotalValueInPence } = require('../../app/currency-convert')

describe('convertToPence', () => {
  test.each([
    [100, 10000],
    [100.00, 10000],
    [-100, -10000],
    [100.10, 10010],
    [100.1, 10010],
    ['100', 10000],
    ['100.00', 10000],
    ['100.10', 10010],
    ['100.1', 10010],
    [undefined, undefined],
    [null, undefined],
    [{}, undefined],
    [[], undefined],
    [true, undefined],
    [false, undefined],
    [Boolean(), undefined]
  ])('converts %p to %p pence', (input, expected) => {
    expect(convertToPence(input)).toBe(expected)
  })
})

describe('getTotalValueInPence', () => {
  test.each([
    [[{ value: 100 }], 'value', 10000],
    [[{ value: 100 }, { value: 100 }], 'value', 20000],
    [[{ value: 100.00 }, { value: 100.00 }], 'value', 20000],
    [[{ value: 100.1 }, { value: 100.1 }], 'value', 20020],
    [[{ value: 100.10 }, { value: 100.20 }], 'value', 20030],
    [[{ value: 0.14 }, { value: 0.13 }], 'value', 27],
    [[{ value: 0.1 }, { value: 0.2 }], 'value', 30],
    [[{ value: 0.10 }, { value: 0.20 }], 'value', 30],
    [undefined, 'value', undefined],
    [null, 'value', undefined],
    [{}, 'value', undefined],
    [true, 'value', undefined],
    [false, 'value', undefined],
    [Boolean(), 'value', undefined],
    [[], 'value', 0],
    [[{ value: 100 }, { value: 100 }], 'notValue', 0],
    [[{ value: 100 }, { notValue: 100 }], 'value', 10000]
  ])('calculates total value in pence for %p with key %s -> %p', (arr, key, expected) => {
    expect(getTotalValueInPence(arr, key)).toBe(expected)
  })
})
