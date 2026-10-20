const TABLES = require('./tables')

const PRIMARY_KEYS = {
  [TABLES.batches]: 'batchId'
}

const COLUMNS = {
  [TABLES.batches]: [
    'batchId',
    'filename',
    'sequenceNumber',
    'schemeId',
    'statusId',
    'processedOn',
    'createdAt',
    'updatedAt',
    'processingTries'
  ],
  [TABLES.locks]: [
    'lockId'
  ],
  [TABLES.schemes]: [
    'schemeId',
    'scheme'
  ],
  [TABLES.sequences]: [
    'schemeId',
    'next'
  ],
  [TABLES.statuses]: [
    'statusId',
    'status'
  ]
}

const pickColumns = (record, table) => {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([column]) => COLUMNS[table].includes(column))
      .filter(([column]) => column !== PRIMARY_KEYS[table])
  )
}

module.exports = {
  PRIMARY_KEYS,
  COLUMNS,
  pickColumns
}
