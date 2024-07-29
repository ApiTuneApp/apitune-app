import { Form } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'
import { strings } from '@renderer/services/localization'

import MonacoEditor from '../monaco-editor'

type BodyEditorProps = {
  type: 'request' | 'response'
}

function FunctionEditor({ field, type }: AddRuleValueProps & BodyEditorProps): JSX.Element {
  return (
    <Form.Item
      name={[field.name, 'value']}
      rules={[{ required: true, message: strings.funcRequired }]}
      label={
        strings.formatString(
          strings.modifyFunction,
          type === 'request' ? strings.request : strings.response
        ) + ':'
      }
    >
      <MonacoEditor height={400} defaultLanguage="javascript" />
    </Form.Item>
  )
}

export default FunctionEditor
