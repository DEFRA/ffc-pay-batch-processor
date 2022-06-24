module.exports = {
  sfi: {
    schemeId: 1,
    name: 'SFI',
    sourceSystem: 'SFI',
    fileMask: /^SITISFI\d{4}_AP_\d*.dat$/
  },
  sfiPilot: {
    schemeId: 2,
    name: 'SFI Pilot',
    sourceSystem: 'SFIP',
    fileMask: /^SITIELM\d{4}_AP_\d*.dat$/
  },
  lumpSums: {
    schemeId: 3,
    name: 'Lump Sums',
    sourceSystem: 'LSES',
    fileMask: /^SITILSES\d{4}_AP_\d*.dat$/
  }
}
