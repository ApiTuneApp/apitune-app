import { Form } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'

import MonacoEditor from '../monaco-editor'

type BodyEditorProps = {
  type: 'request' | 'response'
}

function FunctionEditor({ field, type }: AddRuleValueProps & BodyEditorProps): JSX.Element {
  return (
    <Form.Item
      name={[field.name, 'value']}
      rules={[{ required: true, message: 'Function is required' }]}
      label={`Modify ${type === 'request' ? 'Request' : 'Response'} Body With Javascript:`}
    >
      <MonacoEditor height={400} defaultLanguage="javascript" />
    </Form.Item>
  )
}

export default FunctionEditor
