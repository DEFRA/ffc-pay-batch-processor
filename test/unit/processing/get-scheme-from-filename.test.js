const getSchemeFromFilename = require('../../../app/processing/get-scheme-from-filename')
const { sfi, sfiPilot, lumpSums } = require('../../../app/schemes')

describe('Get scheme', () => {
  test('returns SFI for SFI filename', async () => {
    const result = getSchemeFromFilename('SITISFI0001_AP_20220317104956617.dat')
    expect(result).toMatchObject(sfi)
  })

  test('returns SFI Pilot for SFI Pilot filename', async () => {
    const result = getSchemeFromFilename('SITIELM0001_AP_20220317104956617.dat')
    expect(result).toMatchObject(sfiPilot)
  })

  test('returns Lump Sums for Lump Sums filename', async () => {
    const result = getSchemeFromFilename('SITILSES_0001_AP_20220317104956617.dat')
    expect(result).toMatchObject(lumpSums)
  })

  test('returns undefined for unknown filename', async () => {
    const result = getSchemeFromFilename('NOTAREALSCHEME_0001_AP_20220317104956617.dat')
    expect(result).toBeUndefined()
  })

  test('returns undefined for no filename', async () => {
    const result = getSchemeFromFilename()
    expect(result).toBeUndefined()
  })

  test('returns undefined for undefined filename', async () => {
    const result = getSchemeFromFilename(undefined)
    expect(result).toBeUndefined()
  })

  test('returns undefined for object filename', async () => {
    const result = getSchemeFromFilename({})
    expect(result).toBeUndefined()
  })

  test('returns undefined for array filename', async () => {
    const result = getSchemeFromFilename([])
    expect(result).toBeUndefined()
  })

  test('returns undefined for null filename', async () => {
    const result = getSchemeFromFilename(null)
    expect(result).toBeUndefined()
  })

  test('returns undefined for true filename', async () => {
    const result = getSchemeFromFilename(true)
    expect(result).toBeUndefined()
  })

  test('returns undefined for false filename', async () => {
    const result = getSchemeFromFilename(false)
    expect(result).toBeUndefined()
  })

  test('returns undefined for 1 filename', async () => {
    const result = getSchemeFromFilename(1)
    expect(result).toBeUndefined()
  })

  test('returns undefined for 0 filename', async () => {
    const result = getSchemeFromFilename(0)
    expect(result).toBeUndefined()
  })

  test('returns undefined for empty string filename', async () => {
    const result = getSchemeFromFilename('')
    expect(result).toBeUndefined()
  })
})
