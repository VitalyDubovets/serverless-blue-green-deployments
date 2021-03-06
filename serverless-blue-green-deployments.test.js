const fs = require('fs')
const path = require('path')
const chai = require('chai')
const _ = require('lodash/fp')
const { getInstalledPathSync } = require('get-installed-path')
const ServerlessBlueGreenDeployments = require('./serverless-blue-green-deployments')

const serverlessPath = getInstalledPathSync('serverless', { local: true })
const AwsProvider = require(`${serverlessPath}/lib/plugins/aws/provider`)
const Serverless = require(`${serverlessPath}/lib/Serverless`)
const { expect } = chai
const fixturesPath = path.resolve(__dirname, 'fixtures')

describe('ServerlessBlueGreenDeployments', () => {
  const stage = 'dev'
  const options = { stage }

  describe('addBlueGreenDeploymentResources', () => {
    const testCaseFiles = fs.readdirSync(fixturesPath)
    const getTestCaseName = _.pipe(_.split('.'), _.head)
    const testCaseFileType = _.pipe(_.split('.'), _.get('[1]'))
    const testCaseContentsFromFiles = _.reduce((acc, fileName) => {
      const contents = JSON.parse(fs.readFileSync(path.resolve(fixturesPath, fileName)))
      return _.set(testCaseFileType(fileName), contents, acc)
    }, {})
    const testCaseFilesByName = _.groupBy(getTestCaseName, testCaseFiles)
    this.testCases = _.map(
      (caseName) => {
        const testCaseContents = testCaseContentsFromFiles(testCaseFilesByName[caseName])
        return Object.assign(testCaseContents, { caseName })
      },
      Object.keys(testCaseFilesByName)
    )

    this.testCases.forEach(({ caseName, input, output, service }) => {
      it(`generates the correct CloudFormation templates: test case ${caseName}`, () => {
        const serverless = new Serverless(options)
        Object.assign(serverless.service, service)
        serverless.service.provider.compiledCloudFormationTemplate = input
        serverless.setProvider('aws', new AwsProvider(serverless, options))
        const plugin = new ServerlessBlueGreenDeployments(serverless, options)
        plugin.addBlueGreenDeploymentResources()
        expect(serverless.service.provider.compiledCloudFormationTemplate).to.deep.equal(output)
      })
    })
  })
})
