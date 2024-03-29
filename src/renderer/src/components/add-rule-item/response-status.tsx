import { useState } from 'react'

import { Autocomplete, TextField } from '@mui/material'
import { AddRuleValueProps } from '@renderer/common/contract'
import { HTTP_STATUS_CODE } from '@shared/constants'

import RuleOutline from './rule-outline'

type StatusOption = {
  value: number
  label: string
}

function ResponseStatus({ rule, setValue, setValid }: AddRuleValueProps): JSX.Element {
  const [errorMsg, setErrorMsg] = useState('')
  function validator(value: number | undefined) {
    let valid = true
    if (!value) {
      valid = false
      setErrorMsg('Status is required')
    } else {
      valid = true
      setErrorMsg('')
    }
    setValid(valid)
  }

  rule.validator = validator

  function onChange(opt: StatusOption | null) {
    validator(opt?.value)
    setValue(opt ? opt.value : '')
  }

  function getValue(value: number | string) {
    value = value || 200
    return HTTP_STATUS_CODE.find((item) => item.value === value)
  }

  return (
    <RuleOutline
      title="Response Status:"
      WrapComponent={
        <Autocomplete
          size="small"
          disableClearable
          options={HTTP_STATUS_CODE}
          getOptionLabel={(option: StatusOption) => option.value.toString()}
          sx={{ flex: 1 }}
          value={getValue(rule.value as number)}
          renderOption={(props, option) => (
            <li {...props}>{`${option.value} - ${option.label}`}</li>
          )}
          onChange={(_, value) => onChange(value as StatusOption)}
          renderInput={(params) => (
            <TextField
              hiddenLabel
              {...params}
              required
              placeholder="please input response status"
              size="small"
              type="number"
              error={!!errorMsg}
              helperText={errorMsg}
            ></TextField>
          )}
        />
      }
    />
  )
}

export default ResponseStatus
