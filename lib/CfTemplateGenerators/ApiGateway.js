const _ = require('lodash/fp')

// function buildUriForAlias (functionAlias) {
//   const aliasArn = [
//     'arn:',
//     { Ref: 'AWS::Partition' },
//     ':apigateway:',
//     { Ref: 'AWS::Region' },
//     ':lambda:path/2015-03-31/functions/',
//     { Ref: functionAlias },
//     '/invocations'
//   ]
//   return { 'Fn::Join': ['', aliasArn] }
// }

function buildUriForAliasV2 (functionAlias) {
  return { Ref: functionAlias }
}

function replaceV2IntegrationUriWithAlias (apiGatewayMethod, functionAlias) {
  const aliasUri = buildUriForAliasV2(functionAlias)
  return _.set('Properties.IntegrationUri', aliasUri, apiGatewayMethod)
}

function replaceMethodUriWithAlias (apiGatewayMethod, functionAlias) {
  const aliasUri = buildUriForAliasV2(functionAlias)
  return _.set('Properties.Integration.Uri', aliasUri, apiGatewayMethod)
}

function replaceV2AuthorizerUriWithAlias (apiGatewayMethod, functionAlias) {
  const aliasUri = buildUriForAliasV2(functionAlias)
  return _.set('Properties.AuthorizerUri', aliasUri, apiGatewayMethod)
}

const ApiGateway = {
  replaceV2IntegrationUriWithAlias,
  replaceMethodUriWithAlias,
  replaceV2AuthorizerUriWithAlias
}

module.exports = ApiGateway
