import { Form } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'
import { strings } from '@renderer/services/localization'

import MonacoEditor from '../monaco-editor'

type BodyEditorProps = {
  type: 'request' | 'response'
}

function BodyEditor({ field, type }: AddRuleValueProps & BodyEditorProps): JSX.Element {
  return (
    <Form.Item
      name={[field.name, 'value']}
      rules={[{ required: true, message: strings.bodyRuleRequired }]}
      label={
        strings.formatString(
          strings.modifyBody,
          type === 'request' ? strings.request : strings.response
        ) + ':'
      }
    >
      <MonacoEditor
        height={200}
        defaultLanguage="json"
        showFullscreenButton
        fullscreenTargetSelector="#ruleEditorContainer"
      />
    </Form.Item>
  )
}

export default BodyEditor
