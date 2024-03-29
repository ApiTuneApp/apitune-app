import { useState } from 'react'

import { AddRuleValueProps } from '@renderer/common/contract'
import MonacoEditor from '../monaco-editor'

import RuleOutline from './rule-outline'
import { Box, FormHelperText } from '@mui/material'

type BodyEditorProps = {
  type: 'request' | 'response'
}

function BodyEditor({
  rule,
  type,
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

  function onChange(value: string | undefined) {
    value = value || ''
    validator(value)
    setValue(value)
  }

  rule.validator = validator
  return (
    <RuleOutline
      title={`Modify ${type === 'request' ? 'Request' : 'Response'} Body:`}
      WrapComponent={
        <Box>
          <MonacoEditor height={400} defaultLanguage="json" onChange={onChange} />
          {errorMsg && (
            <FormHelperText error sx={{ mt: 1 }}>
              {errorMsg}
            </FormHelperText>
          )}
        </Box>
      }
    />
  )
}

export default BodyEditor
