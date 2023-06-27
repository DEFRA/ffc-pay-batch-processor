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
  },
  cs: {
    schemeId: 5,
    name: 'CS',
    sourceSystem: 'SITI AGRI CS SYS',
    fileMask: /^SITICS\d{4}_AP_\d*.dat$/
  },
  bps: {
    schemeId: 6,
    name: 'BPS',
    sourceSystem: 'SITI AGRI SYS',
    fileMask: /^SITI_\d{4}_AP_\d*.dat$/
  },
  fdmr: {
    schemeId: 7,
    name: 'FDMR',
    sourceSystem: 'FDMR',
    fileMask: /^FDMR_\d{4}_AP_\d*.dat$/
  },
  es: {
    schemeId: 9,
    name: 'ES',
    sourceSystem: 'Genesis',
    fileMask: /^GENESISPayReq_\d{8}_\d{4}.gne$/
  }
}
