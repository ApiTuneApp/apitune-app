import { Context, Next } from 'koa'

import { RuleData } from '../../../shared/contract'
import { EditBodyType } from '../contracts'
import { DefaultUserData, isRuleMatch, responseBody } from '../rule-utils'

export default async function RulesMiddleware(ctx: Context, next: Next) {
  // console.log('current api rules =>', DefaultUserData.apiRules)
  const curApiRules = DefaultUserData.apiRules

  // find enabled flated rule list
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
  console.log('matched rules =>', matchedRules)
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
