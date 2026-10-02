const { getSchemes } = require('ffc-pay-schemes')
const { schemes: schemesTable, sequences } = require('./database')

const updateSchemesDatabase = async () => {
  console.log('Checking for updates to supported schemes')
  const schemes = getSchemes()

  for (const { schemeId, schemeName } of schemes) {
    await updateScheme(schemeId, schemeName) // NOSONAR
  }
}

const updateScheme = async (schemeId, schemeName) => {
  const existingScheme = (await schemesTable().where({ schemeId }).first()) ?? null

  await schemesTable()
    .insert({ schemeId, scheme: schemeName })
    .onConflict('schemeId')
    .merge()

  const created = !existingScheme
  if (created) {
    await sequences().insert({ schemeId, next: 1 })
  }
  console.log(`${schemeName} ${created ? 'created' : 'updated'}`)
}

module.exports = {
  updateSchemesDatabase
}
