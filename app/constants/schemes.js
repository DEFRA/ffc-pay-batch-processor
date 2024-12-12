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
  },
  fc: {
    schemeId: 10,
    name: 'FC',
    sourceSystem: 'GLOS',
    fileMask: /^FCAP_\d{4}_\d*\.dat$/
  },
  imps: {
    schemeId: 11,
    name: 'IMPS',
    sourceSystem: 'IMPS',
    fileMask: /^FIN_IMPS_A[P|R]_\d*.INT$/
  },
  sfi23: {
    schemeId: 12,
    name: 'SFI23',
    sourceSystem: 'SFIA',
    fileMask: /^SITISFIA\d{4}_AP_\d*.dat$/
  },
  delinked: {
    schemeId: 13,
    name: 'Delinked',
    sourceSystem: 'DP',
    fileMask: /^SITIDP\d{4}_AP_\d*.dat$/
  },
  sfiExpanded: {
    schemeId: 14,
    name: 'SFI Expanded',
    sourceSystem: 'ESFIO',
    fileMask: /^ESFIO\d{4}_AP_\d*.dat$/
  }
}
