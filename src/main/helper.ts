import { Context } from 'koa'
import { RuleData } from '../shared/contract'

export function isRuleMatch(ctx: Context, rule: RuleData) {
  const { matches } = rule
  const { method, href, host, path } = ctx
  const { matchType, matchMode, methods } = matches
  let value = matches.value
  let matchValue = ''
  if (matchType === 'url') {
    matchValue = href
  } else if (matchType === 'host') {
    matchValue = host
  } else if (matchType === 'path') {
    // remove first caracter '/'
    matchValue = path.length > 1 ? path.slice(1) : path
    value = value.startsWith('/') ? value.slice(1) : value
  }

  const methodValue = method.toUpperCase()
  if (methods?.length > 0 && !methods.includes(methodValue)) {
    return false
  }
  if (matchMode === 'contains') {
    return matchValue.includes(value)
  } else if (matchMode === 'equals') {
    return matchValue === value
  } else if (matchMode === 'matches') {
    return new RegExp(value).test(matchValue)
  }
  return false
}
