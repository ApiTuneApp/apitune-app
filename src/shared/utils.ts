import { ApiRules, RuleData, RuleGroup } from './contract'

export function isURL(url: string): boolean {
  const expression =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
  const regex = new RegExp(expression)
  return regex.test(url)
}

export function findGroupOrRule(
  rules: ApiRules,
  id: string | undefined
): RuleData | RuleGroup | null {
  if (!id) {
    return null
  }
  for (const item of rules) {
    if (item.id === id) return item
    if ((item as RuleGroup).ruleList) {
      const rule = findGroupOrRule((item as RuleGroup).ruleList, id)
      if (rule) return rule
    }
  }
  return null
}

export function findParentGroup(rules: ApiRules, id: string): RuleGroup | null {
  for (const item of rules) {
    if ((item as RuleGroup).ruleList) {
      if ((item as RuleGroup).ruleList.some((rule) => rule.id === id)) {
        return item as RuleGroup
      }
      const group = findParentGroup((item as RuleGroup).ruleList, id)
      if (group) return group
    }
  }
  return null
}

export function IsJsonString(str: string) {
  try {
    const json = JSON.parse(str)
    return typeof json === 'object'
  } catch (e) {
    return false
  }
}

export const getAvatarUrl = (user: any) => {
  if (user?.avatar) {
    return user.avatar
  }
  // Option 1: DiceBear (many different styles available)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${
    user?.email || user?.id
  }&radius=50&backgroundColor=b6e3f4`

  // Option 2: UI Avatars (text-based)
  // return `https://ui-avatars.com/api/?name=${
  //   user?.email?.charAt(0) || "U"
  // }&background=random`;
}

export const findRuleCount = (rules: ApiRules): number => {
  return rules.reduce((acc, item) => {
    if (item.kind === 'rule') {
      return acc + 1
    }
    if (item.kind === 'group' && item.ruleList) {
      return acc + findRuleCount(item.ruleList)
    }
    return acc
  }, 0)
}
