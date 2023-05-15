const appInsights = require('applicationinsights')

const setup = () => {
  if (process.env.APPINSIGHTS_CONNECTIONSTRING) {
    appInsights.setup(process.env.APPINSIGHTS_CONNECTIONSTRING)
      .setAutoCollectDependencies(false)
      .start()
    console.log('App Insights Running')
    const cloudRoleTag = appInsights.defaultClient.context.keys.cloudRole
    const appName = process.env.APPINSIGHTS_CLOUDROLE

    const client = appInsights.defaultClient
    client.context.tags[cloudRoleTag] = appName
  } else {
    console.log('App Insights Not Running')
  }
}

module.exports = { setup }
