
module.exports = {
  default: {
    publishQuiet: true,
    require: ['step_definitions/**/*.js'],
    parallel: 1,
    format: ['html:reports/cucumber-report.html']
  },
}