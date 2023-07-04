const { retry } = require('../../retry')
const { getFile } = require('../../storage')

const findGlosControlFile = async (paymentFile) => {
  await retry(() => getFile(paymentFile.replace(/(.dat)$/g, '.ctl')))
}

module.exports = {
  findGlosControlFile
}
