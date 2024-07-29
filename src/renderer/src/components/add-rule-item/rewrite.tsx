import { Form, Input } from 'antd'

import { strings } from '@renderer/services/localization'
import { AddRuleValueProps } from '@renderer/common/contract'

function Rewrite({ field }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label={strings.rewriteTo + ':'}
      name={[field.name, 'value']}
      rules={[
        { required: true, message: strings.rewriteUrlRequired },
        { type: 'url', message: strings.invalidUrl }
      ]}
    >
      <Input placeholder={strings.inputRewriteUrl} />
    </Form.Item>
  )
}

export default Rewrite
