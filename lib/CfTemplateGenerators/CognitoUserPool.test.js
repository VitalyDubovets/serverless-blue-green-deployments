const fs = require('fs')
const CognitoUserPool = require('./CognitoUserPool')
const { expect } = require('chai')
const path = require('path')
const { getInstalledPathSync } = require('get-installed-path')

const serverlessPath = getInstalledPathSync('serverless', { local: true })
const AwsProvider = require(`${serverlessPath}/lib/plugins/aws/provider`)
const Serverless = require(`${serverlessPath}/lib/Serverless`)
const ServerlessBlueGreenDeployments = require('../../serverless-blue-green-deployments')

const fixturesPath = path.resolve(__dirname, '..', '..', 'fixtures')
const filePathService = path.resolve(fixturesPath, '13.service.cognito-user-pool.json')
const filePathInput = path.resolve(fixturesPath, '13.input.cognito-user-pool.json')

describe('CognitoUserPool', () => {
  const stage = 'dev'
  const options = { stage }

  const service = JSON.parse(fs.readFileSync(filePathService))
  const serverless = new Serverless(options)
  Object.assign(serverless.service, service)
  serverless.service.provider.compiledCloudFormationTemplate = JSON.parse(fs.readFileSync(filePathInput))
  serverless.setProvider('aws', new AwsProvider(serverless, options))
  const plugin = new ServerlessBlueGreenDeployments(serverless, options)
  plugin.addBlueGreenDeploymentResources()

  describe('.replaceCloudWatchLogsDestinationArnWithAlias', () => {
    const firstServerlessFnName = 'hello'
    const secondServerlessFnName = 'hello2'
    const thirdServerlessFnName = 'hello3'
    const firstFunctionName = 'HelloLambdaFunction'
    const secondFunctionName = 'Hello2LambdaFunction'
    const thirdFunctionName = 'Hello3LambdaFunction'
    const functionAlias = 'FunctionWithAlias'
    const cognitoUserPool = {
      Type: 'AWS::Cognito::UserPool',
      Properties: {
        UserPoolName: 'users',
        LambdaConfig: {
          PreSignUp: {
            'Fn::GetAtt': [
              'HelloLambdaFunction',
              'Arn'
            ]
          },
          CustomMessage: {
            'Fn::GetAtt': [
              'Hello2LambdaFunction',
              'Arn'
            ]
          },
          PostAuthentication: {
            'Fn::GetAtt': [
              'Hello3LambdaFunction',
              'Arn'
            ]
          }
        }
      }
    }

    it('replaces the log destination arn function for an alias', () => {
      const expected = {
        Type: 'AWS::Cognito::UserPool',
        Properties: {
          UserPoolName: 'users',
          LambdaConfig: {
            PreSignUp: {
              Ref: functionAlias
            },
            CustomMessage: {
              'Fn::GetAtt': [
                'Hello2LambdaFunction',
                'Arn'
              ]
            },
            PostAuthentication: {
              'Fn::GetAtt': [
                'Hello3LambdaFunction',
                'Arn'
              ]
            }
          }
        }
      }
      const actual = CognitoUserPool
        .replaceCognitoUserPoolWithAlias(
          cognitoUserPool, functionAlias, firstFunctionName, serverless.service, firstServerlessFnName
        )
      expect(actual).to.deep.equal(expected)
    })

    it('replaces the log destination arn function for an alias', () => {
      const expected = {
        Type: 'AWS::Cognito::UserPool',
        Properties: {
          UserPoolName: 'users',
          LambdaConfig: {
            PreSignUp: {
              'Fn::GetAtt': [
                'HelloLambdaFunction',
                'Arn'
              ]
            },
            CustomMessage: {
              Ref: functionAlias
            },
            PostAuthentication: {
              'Fn::GetAtt': [
                'Hello3LambdaFunction',
                'Arn'
              ]
            }
          }
        }
      }
      const actual = CognitoUserPool
        .replaceCognitoUserPoolWithAlias(
          cognitoUserPool, functionAlias, secondFunctionName, serverless.service, secondServerlessFnName
        )
      expect(actual).to.deep.equal(expected)
    })

    it('replaces the log destination arn function for an alias', () => {
      const expected = {
        Type: 'AWS::Cognito::UserPool',
        Properties: {
          UserPoolName: 'users',
          LambdaConfig: {
            PreSignUp: {
              'Fn::GetAtt': [
                'HelloLambdaFunction',
                'Arn'
              ]
            },
            CustomMessage: {
              'Fn::GetAtt': [
                'Hello2LambdaFunction',
                'Arn'
              ]
            },
            PostAuthentication: {
              Ref: functionAlias
            }
          }
        }
      }
      const actual = CognitoUserPool
        .replaceCognitoUserPoolWithAlias(
          cognitoUserPool, functionAlias, thirdFunctionName, serverless.service, thirdServerlessFnName
        )
      expect(actual).to.deep.equal(expected)
    })
  })
})
