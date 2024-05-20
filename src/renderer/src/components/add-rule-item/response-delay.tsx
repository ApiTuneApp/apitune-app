import { Form, Input } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'

function ResponseDelay({ field }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label="Response Delay time:"
      name={[field.name, 'value']}
      rules={[{ required: true, message: 'Delay time is required' }]}
    >
      <Input type="number" placeholder="please input response delay time" addonAfter="ms" />
    </Form.Item>
  )
}

export default ResponseDelay
