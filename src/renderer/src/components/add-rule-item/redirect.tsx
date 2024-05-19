import { Form, Input } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'

function Redirect({ field }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label="Redirects to:"
      name={[field.name, 'value']}
      rules={[
        { required: true, message: 'Redirect url is required' },
        { type: 'url', message: 'Invalid url' }
      ]}
    >
      <Input placeholder="please input redirect url" />
    </Form.Item>
  )
}

export default Redirect
