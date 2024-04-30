import { useState } from 'react'

import { AddRuleValueProps } from '@renderer/common/contract'
import MonacoEditor from '../monaco-editor'

import RuleOutline from './rule-outline'
import { Box, FormHelperText } from '@mui/material'

type BodyEditorProps = {
  type: 'request' | 'response'
}

function FunctionEditor({
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
      setErrorMsg('Function code is required')
    } else {
      valid = true
      setErrorMsg('')
    }
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
      title={`Add ${type === 'request' ? 'Request' : 'Response'} Function:`}
      WrapComponent={
        <Box>
          <MonacoEditor
            height={200}
            defaultLanguage="javascript"
            onChange={onChange}
            value={rule.value as string}
          />
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

export default FunctionEditor
