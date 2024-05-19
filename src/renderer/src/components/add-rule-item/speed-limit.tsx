import { Input, Form } from 'antd'
import { AddRuleValueProps } from '@renderer/common/contract'

function SpeedLimit({ rule }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label="Speed limit:"
      name={rule.type}
      rules={[{ required: true, message: 'Speed limit is required' }]}
    >
      <Input type="number" placeholder="please input speed limit" addonAfter="KB/s" />
    </Form.Item>
  )
}

export default SpeedLimit
