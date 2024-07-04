import { Form, Input } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'

function Rewrite({ field }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label="Rewrite to:"
      name={[field.name, 'value']}
      rules={[
        { required: true, message: 'Rewrite url is required' },
        { type: 'url', message: 'Invalid url' }
      ]}
    >
      <Input placeholder="please input rewrite url" />
    </Form.Item>
  )
}

export default Rewrite
