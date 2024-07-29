import { Form, Input } from 'antd'

import { strings } from '@renderer/services/localization'
import { AddRuleValueProps } from '@renderer/common/contract'

function SpeedLimit({ field }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label={strings.speedLimit + ':'}
      name={[field.name, 'value']}
      rules={[{ required: true, message: strings.speedLimitRequired }]}
    >
      <Input type="number" placeholder={strings.inputSpeedLimit} addonAfter="KB/s" />
    </Form.Item>
  )
}

export default SpeedLimit
