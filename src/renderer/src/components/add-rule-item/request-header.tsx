import { useState } from 'react'

import { Box, MenuItem, Select } from '@mui/material'
import { AddRuleValueProps } from '@renderer/common/contract'

import RuleOutline from './rule-outline'

function RequestHeader({ rule, setValue }: AddRuleValueProps): JSX.Element {
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
      title="Modify request headers:"
      WrapComponent={
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Select defaultValue={'add'}>
            <MenuItem value="add">Add</MenuItem>
            <MenuItem value="override">Override</MenuItem>
            <MenuItem value="remove">Remove</MenuItem>
          </Select>
        </Box>
      }
    />
  )
}

export default RequestHeader
