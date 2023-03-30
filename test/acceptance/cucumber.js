
module.exports = {
  default: {
    publishQuiet: true,
    paths: ['test/acceptance/features/**/*.feature'],
    backtrace: true,
    require: ['test/acceptance/step_definitions/**/*.js'],
    parallel: 1,
    format: ['html:test-output/cucumber-report.html']
  }
}
