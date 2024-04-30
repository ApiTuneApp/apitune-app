import { RuleType } from '@shared/contract'

export interface RuleItem {
  type: RuleType
  value: string | object | number | Array<any>
  valid: boolean
  validator?: (value: any) => void
}

export interface AddRuleValueProps {
  rule: RuleItem
  setValue: (value: RuleItem['value']) => void
  setValid: (valid: RuleItem['valid']) => void
}
