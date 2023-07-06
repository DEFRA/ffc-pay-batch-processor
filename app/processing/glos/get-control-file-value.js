const { Readable } = require('stream')
const readline = require('readline')
const storage = require('../../storage')

const getControlFileValue = async (filename) => {
  const controlFileBuffer = await storage.downloadPaymentFile(filename.replace(/(.dat)$/g, '.ctl'))
  const input = Readable.from(controlFileBuffer)
  const readControlFile = readline.createInterface(input)
  let value

  return new Promise((resolve, reject) => {
    readControlFile.on('line', (line) => {
      value = line
    })
    readControlFile.on('close', () => {
      resolve(parseInt(value))
      reject(new Error('Unable to read file'))
      readControlFile.close()
    })
  })
}

module.exports = {
  getControlFileValue
}
