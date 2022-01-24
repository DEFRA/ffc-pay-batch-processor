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
  }
}

module.exports = filenameMasks
