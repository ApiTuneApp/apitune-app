import { useState } from 'react'

import { InputAdornment, TextField } from '@mui/material'
import { AddRuleValueProps } from '@renderer/common/contract'

import RuleOutline from './rule-outline'

function SpeedLimit({ rule, setValue }: AddRuleValueProps): JSX.Element {
  const [errorMsg, setErrorMsg] = useState('')
  function validator(value: string) {
    let valid = true
    if (!value || !value.trim()) {
      valid = false
      setErrorMsg('Speed limit is required')
    } else {
      valid = true
      setErrorMsg('')
    }
    rule.valid = valid
  }

  rule.validator = validator
  return (
    <RuleOutline
      title="Speed limit:"
      WrapComponent={
        <TextField
          hiddenLabel
          fullWidth
          required
          placeholder="please input speed limit"
          size="small"
          value={rule.value}
          type="number"
          error={!!errorMsg}
          helperText={errorMsg}
          onChange={(e) => {
            const value = e.target.value
            validator(value)
            setValue(value)
          }}
          InputProps={{
            endAdornment: <InputAdornment position="start">KB/s</InputAdornment>
          }}
        ></TextField>
      }
    />
  )
}

export default SpeedLimit
