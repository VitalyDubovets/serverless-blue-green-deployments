const _ = require('lodash/fp')

function getTypeOfCognitoTrigger (functionName, service, serverlessFnName) {
  try {
    const cognitoEvents = service.getFunction(serverlessFnName).events.filter(item => item.cognitoUserPool)
    if (cognitoEvents.length > 0) {
      return cognitoEvents[0].cognitoUserPool.trigger
    }
  } catch (e) {
    return null
  }
}

function replaceCognitoUserPoolWithAlias (cognitoUserPool, functionAlias, functionName, service, serverlessFnName) {
  const cognitoTrigger = getTypeOfCognitoTrigger(functionName, service, serverlessFnName)
  const pathToLambdaTrigger = `Properties.LambdaConfig.${cognitoTrigger}`
  const lambdaTriggerConfig = _.get(pathToLambdaTrigger, cognitoUserPool)
  const targetDetails = (lambdaTriggerConfig['Fn::GetAtt'] || [])
  const [funcName] = targetDetails
  if (funcName && funcName === functionName) {
    return _.set(pathToLambdaTrigger, { Ref: functionAlias }, cognitoUserPool)
  }
  return cognitoUserPool
}

const CognitoUserPool = {
  getTypeOfCognitoTrigger,
  replaceCognitoUserPoolWithAlias
}

module.exports = CognitoUserPool
