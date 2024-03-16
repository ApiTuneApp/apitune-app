import { Rules } from '@common/contract'

export interface RuleItem {
  type: Rules
  value: string | object
  valid: boolean
  validator?: (value: any) => void
}

export interface AddRuleValueProps {
  rule: RuleItem
  setValue: (value: RuleItem['value']) => void
}
