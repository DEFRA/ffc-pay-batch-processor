const schemes = {
  sfi: {
    dbSchemeId: 1,
    filenameId: 'SITIELM'
  }
}

function getDbIdentifier (filenameId) {
  return Object.values(schemes).find(s => s.filenameId === filenameId)?.dbSchemeId
}

module.exports = {
  getDbIdentifier
}
