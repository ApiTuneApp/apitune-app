import { RuleType } from '@shared/contract'
import { FormInstance, FormListFieldData } from 'antd'

export interface RuleItem {
  type: RuleType
  value: string | object | number | Array<any>
}

export interface AddRuleValueProps {
  form: FormInstance
  field: FormListFieldData
}
