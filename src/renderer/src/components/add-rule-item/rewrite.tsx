import { Form, Input } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'

import { strings } from '@renderer/services/localization'
import { AddRuleValueProps } from '@renderer/common/contract'

function Rewrite({ field }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      label={
        <span>
          {strings.rewriteTo + ':'}
          <Tooltip title={strings.rewriteTips}>
            <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
          </Tooltip>
        </span>
      }
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
