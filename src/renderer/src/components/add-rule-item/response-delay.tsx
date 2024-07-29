import { Form, Input } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'
import { strings } from '@renderer/services/localization'

function ResponseDelay({ field }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label={strings.repDelayTime + ':'}
      name={[field.name, 'value']}
      rules={[{ required: true, message: strings.delayRequired }]}
    >
      <Input type="number" placeholder={strings.inputResDelayTime} addonAfter="ms" />
    </Form.Item>
  )
}

export default ResponseDelay
