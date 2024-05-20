import { Form } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'

import MonacoEditor from '../monaco-editor'

type BodyEditorProps = {
  type: 'request' | 'response'
}

function BodyEditor({ field, type }: AddRuleValueProps & BodyEditorProps): JSX.Element {
  return (
    <Form.Item
      name={[field.name, 'value']}
      rules={[{ required: true, message: 'Body Rule is required' }]}
      label={`Modify ${type === 'request' ? 'Request' : 'Response'} Body:`}
    >
      <MonacoEditor height={200} defaultLanguage="json" />
    </Form.Item>
  )
}

export default BodyEditor
