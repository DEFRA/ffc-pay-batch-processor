const getScheme = require('../../../app/processing/get-scheme')
const { sfi, sfiPilot, lumpSums } = require('../../../app/schemes')

describe('Get scheme', () => {
  test('returns SFI for SFI filename', async () => {
    const result = getScheme('SITISFI0001_AP_20220317104956617.dat')
    expect(result).toMatchObject(sfi)
  })

  test('returns SFI Pilot for SFI Pilot filename', async () => {
    const result = getScheme('SITIELM0001_AP_20220317104956617.dat')
    expect(result).toMatchObject(sfiPilot)
  })

  test('returns Lump Sums for Lump Sums filename', async () => {
    const result = getScheme('SITILSES_0001_AP_20220317104956617.dat')
    expect(result).toMatchObject(lumpSums)
  })

  test('returns undefined for unknown filename', async () => {
    const result = getScheme('NOTAREALSCHEME_0001_AP_20220317104956617.dat')
    expect(result).toBeUndefined()
  })

  test('returns undefined for no filename', async () => {
    const result = getScheme()
    expect(result).toBeUndefined()
  })

  test('returns undefined for undefined filename', async () => {
    const result = getScheme(undefined)
    expect(result).toBeUndefined()
  })

  test('returns undefined for object filename', async () => {
    const result = getScheme({})
    expect(result).toBeUndefined()
  })

  test('returns undefined for array filename', async () => {
    const result = getScheme([])
    expect(result).toBeUndefined()
  })

  test('returns undefined for null filename', async () => {
    const result = getScheme(null)
    expect(result).toBeUndefined()
  })

  test('returns undefined for true filename', async () => {
    const result = getScheme(true)
    expect(result).toBeUndefined()
  })

  test('returns undefined for false filename', async () => {
    const result = getScheme(false)
    expect(result).toBeUndefined()
  })

  test('returns undefined for 1 filename', async () => {
    const result = getScheme(1)
    expect(result).toBeUndefined()
  })

  test('returns undefined for 0 filename', async () => {
    const result = getScheme(0)
    expect(result).toBeUndefined()
  })

  test('returns undefined for empty string filename', async () => {
    const result = getScheme('')
    expect(result).toBeUndefined()
  })
})
