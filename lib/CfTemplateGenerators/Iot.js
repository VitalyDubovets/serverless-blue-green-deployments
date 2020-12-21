const _ = require('lodash/fp')

function replaceIotTopicRuleActionArnWithAlias (iotTopicRule, functionAlias) {
  return _.set(
    'Properties.TopicRulePayload.Actions[0].Lambda.FunctionArn',
    { Ref: functionAlias },
    iotTopicRule
  )
}

const Iot = {
  replaceIotTopicRuleActionArnWithAlias
}

module.exports = Iot
