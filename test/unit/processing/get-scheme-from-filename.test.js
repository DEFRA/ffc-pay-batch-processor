const getSchemeFromFilename = require('../../../app/processing/get-scheme-from-filename')
const { sfi, sfiPilot, lumpSums } = require('../../../app/constants/schemes')

describe('Get scheme from filename', () => {
  test.each([
    ['SFI filename', 'SITISFI0001_AP_20220317104956617.dat', sfi],
    ['SFI Pilot filename', 'SITIELM0001_AP_20220317104956617.dat', sfiPilot],
    ['Lump Sums filename', 'SITILSES0001_AP_20220317104956617.dat', lumpSums]
  ])('returns correct scheme for %s', (_, filename, expectedScheme) => {
    const result = getSchemeFromFilename(filename)
    expect(result).toMatchObject(expectedScheme)
  })

  test.each([
    ['unknown filename', 'NOTAREALSCHEME_0001_AP_20220317104956617.dat'],
    ['no filename', undefined],
    ['undefined filename', undefined],
    ['object filename', {}],
    ['array filename', []],
    ['null filename', null],
    ['true filename', true],
    ['false filename', false],
    ['numeric 1 filename', 1],
    ['numeric 0 filename', 0],
    ['empty string filename', '']
  ])('returns undefined for %s', (_, filename) => {
    const result = getSchemeFromFilename(filename)
    expect(result).toBeUndefined()
  })
})
