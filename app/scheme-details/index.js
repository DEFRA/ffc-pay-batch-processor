const db = require('../data')

async function getDbIdentifier (schemeName) {
  const scheme = await db.scheme.findOne({ where: { scheme: schemeName } })
  return scheme?.schemeId
}

module.exports = {
  getDbIdentifier
}
