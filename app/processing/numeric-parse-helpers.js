const parseInteger = (value) => {
  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? undefined : parsedValue
}

const parseFloatValue = (value) => {
  const parsedValue = Number.parseFloat(value)
  return Number.isNaN(parsedValue) ? undefined : parsedValue
}

module.exports = {
  parseInteger,
  parseFloatValue
}
