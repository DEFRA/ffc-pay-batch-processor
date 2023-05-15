const { N00 } = require('../../constants/line-codes')

const isNetLine = (invoiceLine) => {
  return invoiceLine.description.startsWith(N00)
}

module.exports = {
  isNetLine
}
