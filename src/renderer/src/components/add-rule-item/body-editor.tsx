import { useState } from 'react'

import { AddRuleValueProps } from '@renderer/common/contract'
import MonacoEditor from '../monaco-editor'

import RuleOutline from './rule-outline'

type BodyEditorProps = {
  type: 'request' | 'response'
}

function BodyEditor({
  rule,
  setValue,
  setValid
}: AddRuleValueProps & BodyEditorProps): JSX.Element {
  const [errorMsg, setErrorMsg] = useState('')

  function validator(value: string) {
    let valid = true
    if (!value || !value.trim()) {
      valid = false
      setErrorMsg('Body Rule is required')
    } else {
      valid = true
      setErrorMsg('')
    }
    // rule.valid = valid
    setValid(valid)
  }

  rule.validator = validator
  return (
    <RuleOutline
      title="Body Rule:"
      WrapComponent={<MonacoEditor height={400} defaultLanguage="json" />}
    />
  )
}

export default BodyEditor
