const Joi = require('joi')

// Define config schema
const schema = Joi.object({
  connectionStr: Joi.string().when('useConnectionStr', { is: true, then: Joi.required(), otherwise: Joi.allow('').optional() }),
  storageAccount: Joi.string().required(),
  container: Joi.string().required(),
  inboundFolder: Joi.string().required(),
  archiveFolder: Joi.string().required(),
  quarantineFolder: Joi.string().required(),
  useConnectionStr: Joi.boolean().default(false),
  createContainers: Joi.boolean().default(false),
  managedIdentityClientId: Joi.string().optional()
})

// Build config
const config = {
  connectionStr: process.env.AZURE_STORAGE_CONNECTION_STRING,
  storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  container: 'batch',
  inboundFolder: 'inbound',
  archiveFolder: 'archive',
  quarantineFolder: 'quarantine',
  useConnectionStr: process.env.AZURE_STORAGE_USE_CONNECTION_STRING,
  createContainers: process.env.AZURE_STORAGE_CREATE_CONTAINERS,
  managedIdentityClientId: process.env.AZURE_CLIENT_ID
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The blob storage config is invalid. ${result.error.message}`)
}

module.exports = result.value
