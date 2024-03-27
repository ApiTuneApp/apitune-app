import { useState } from 'react'

import { TextField } from '@mui/material'
import { AddRuleValueProps } from '@renderer/common/contract'

import RuleOutline from './rule-outline'

type BodyEditorProps = {
  type: 'request' | 'response'
}

function BodyEditor({ rule, setValue }: AddRuleValueProps & BodyEditorProps): JSX.Element {
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
    rule.valid = valid
  }

  rule.validator = validator
  return <RuleOutline title="Body Rule:" WrapComponent={<TextField multiline />} />
}

export default BodyEditor
