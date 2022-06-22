const filenameMasks = {
  sfi: {
    scheme: 'SFI',
    schemeType: 'SITISFI',
    mask: '####### #### ## #######',
    data: {
      source: '',
      batchId: '',
      prefix: '',
      date: ''
    }
  },
  sfiPilot: {
    scheme: 'SFI Pilot',
    schemeType: 'SITIELM',
    mask: '####### #### ## #######',
    data: {
      source: '',
      batchId: '',
      prefix: '',
      date: ''
    }
  },
  lumpSums: {
    scheme: 'Lump Sums',
    schemeType: 'SITILSES',
    mask: '####### #### ## #######',
    data: {
      source: '',
      batchId: '',
      prefix: '',
      date: ''
    }
  }
}

module.exports = filenameMasks
