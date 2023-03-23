
module.exports = {
  default: {
    publishQuiet: true,
    require: ['step_definitions/**/*.js'],
    parallel: 1,
    format: ['html:test-output/cucumber-report.html']
  }
}
