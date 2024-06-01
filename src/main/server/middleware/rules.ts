import { Context, Next } from 'koa'

import { RuleData, RuleType } from '../../../shared/contract'
import { isRuleMatch } from '../../helper'
import { DefaultRuleData } from '../../storage'
import * as ruleHandlers from '../rule-handler'

const requestHandlerMap = {
  [RuleType.Redirect]: {
    handler: ruleHandlers.rewrite
  },
  [RuleType.RequestHeader]: {
    handler: ruleHandlers.requestHeaders
  },
  [RuleType.RequestBody]: {
    handler: ruleHandlers.requestBody
  },
  [RuleType.RequestFunction]: {
    handler: ruleHandlers.requestFunction
  },
  [RuleType.SpeedLimit]: {
    handler: ruleHandlers.requestSpeedLimit
  }
}

const responseHanderMap = {
  [RuleType.ResponseHeader]: {
    handler: ruleHandlers.responseHeaders
  },
  [RuleType.ResponseBody]: {
    handler: ruleHandlers.responseBody
  },
  [RuleType.ResponseDelay]: {
    handler: ruleHandlers.responseDelay
  },
  [RuleType.ResponseStatus]: {
    handler: ruleHandlers.responseStatus
  },
  [RuleType.ResponseFunction]: {
    handler: ruleHandlers.responseFunction
  }
}

export default async function RulesMiddleware(ctx: Context, next: Next) {
  const curApiRules = DefaultRuleData.apiRules

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
    for (const modify of rule.modifyList) {
      const handler = requestHandlerMap[modify.type]
      if (handler) {
        console.log('start handle request rule ===>', rule, modify)
        await handler.handler(ctx, modify)
      }
    }
  }
  // send request, get data
  await next()

  for (const rule of matchedRules) {
    // run rule handler
    for (const modify of rule.modifyList) {
      const handler = responseHanderMap[modify.type]
      if (handler) {
        console.log('start handle response rule ===>', rule, modify)
        await handler.handler(ctx, modify)
      }
    }
  }
}
