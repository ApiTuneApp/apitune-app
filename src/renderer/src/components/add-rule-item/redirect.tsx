import { useState } from 'react'

import { Box, TextField } from '@mui/material'
import { AddRuleValueProps } from '@renderer/common/contract'
import { isURL } from '@shared/utils'

function Redirect({ rule, setValue }: AddRuleValueProps): JSX.Element {
  const [errorMsg, setErrorMsg] = useState('')
  function validator(value: string) {
    let valid = true
    if (!value || !value.trim()) {
      setErrorMsg('Redirect url is required')
      valid = false
    } else if (!isURL(value)) {
      setErrorMsg('Invalid url')
      valid = false
    } else {
      setErrorMsg('')
      valid = true
    }
    rule.valid = valid
  }
  rule.validator = validator
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    validator(value)
    setValue(value)
  }

  return (
    <Box className="rule-value-item">
      <div className="rule-value-title">Redirects to</div>
      <TextField
        hiddenLabel
        fullWidth
        required
        placeholder="please input redirect url"
        size="small"
        error={!!errorMsg}
        value={rule.value}
        helperText={errorMsg}
        onChange={onChange}
      ></TextField>
    </Box>
  )
}

export default Redirect
