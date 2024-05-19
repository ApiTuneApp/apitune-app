import { Input, Form } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'

function Redirect({ rule }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label="Redirects to:"
      name={rule.type}
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
