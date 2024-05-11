import { Context, Next } from 'koa'

import { RuleData, RuleType } from '../../../shared/contract'
import { isRuleMatch } from '../../helper'
import { DefaultUserData } from '../../storage'
import * as ruleHandlers from '../rule-handler'

const requestHandlerMap = {
  [RuleType.Redirect]: {
    handler: ruleHandlers.rewrite
  },
  [RuleType.RequestHeader]: {
    handler: ruleHandlers.requestHeaders
  }
}

export default async function RulesMiddleware(ctx: Context, next: Next) {
  const curApiRules = DefaultUserData.apiRules

  // find enabled rule list
  const enableRuleDataList: RuleData[] = []
  for (const rule of curApiRules) {
    if (rule.kind === 'group' && rule.enable) {
      for (const ruleItem of rule.ruleList) {
        if (ruleItem.enable) {
          enableRuleDataList.push(ruleItem)
        }
      }
    } else if (rule.kind === 'rule' && rule.enable) {
      enableRuleDataList.push(rule)
    }
  }

  const matchedRules = enableRuleDataList.filter((rule) => isRuleMatch(ctx, rule))

  for (const rule of matchedRules) {
    // run rule handler
    for (const changes of rule.modifyList) {
      const handler = requestHandlerMap[changes.type]
      if (handler) {
        console.log('start handle rule ===>', rule, changes)
        handler.handler(ctx, changes)
      }
    }
  }
  // send request, get data
  await next()

  // mock res data
  // responseBody(ctx, {
  //   type: EditBodyType.overwrite,
  //   content: Buffer.from(
  //     JSON.stringify({
  //       data: 'mock data'
  //     })
  //   )
  // })
}
