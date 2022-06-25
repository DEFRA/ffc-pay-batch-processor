const schemes = require('../schemes')

const getSchemeFromFilename = (filename) => {
  const scheme = Object.entries(schemes)
    .map(([key, value]) => ({ [key]: value }))
    .find(x => x[Object.keys(x)[0]].fileMask.test(filename))
  return scheme ? scheme[Object.keys(scheme)[0]] : undefined
}

module.exports = getSchemeFromFilename
