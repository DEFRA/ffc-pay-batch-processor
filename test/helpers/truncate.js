const db = require('../../app/database')

const tables = [
  'batches',
  'lock',
  'schemes',
  'sequences',
  'statuses'
]

const truncate = async () => {
  const quoted = tables.map(table => `"${table}"`).join(', ')
  await db.client.raw(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`)
}

module.exports = {
  truncate
}
