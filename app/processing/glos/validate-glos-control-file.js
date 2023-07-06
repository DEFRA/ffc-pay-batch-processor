
const { getControlFileValue } = require('./get-control-file-value')
const { getTotalLinesFromGlosFile } = require('./get-total-lines-from-glos-file')

const validateGlosControlFile = async (readGlosPaymentFile, filename) => {
  const totalLines = await getTotalLinesFromGlosFile(readGlosPaymentFile)
  const controlFileValue = await getControlFileValue(filename)

  if (controlFileValue !== totalLines) {
    // raise event
    // quarantine both files?
    throw new Error('Glos payment file has failed control file validation')
  }
  console.log('Glos payment file sucessfully validated against control file')
  // archive the ctrl file at this point?
}

module.exports = {
  validateGlosControlFile
}
