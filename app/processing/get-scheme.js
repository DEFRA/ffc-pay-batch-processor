const schemes = require('../schemes')

const getScheme = (filename) => {
  const scheme = Object.entries(schemes)
    .map(([key, value]) => ({ [key]: value }))
    .find(x => x[Object.keys(x)[0]].fileMask.test(filename))
  return scheme ? scheme[Object.keys(scheme)[0]] : undefined
}

module.exports = getScheme
