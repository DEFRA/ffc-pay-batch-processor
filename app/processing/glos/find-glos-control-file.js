const { retry } = require('../../retry')
const { getFile } = require('../../storage')

const findGlosControlFile = async (paymentFile) => {
  try {
    await retry(() => getFile(paymentFile.replace(/(.dat)$/g, '.ctl')))
  } catch (err) {
    console.log(`unable to find control file for ${paymentFile}`)
  }
}

module.exports = {
  findGlosControlFile
}
