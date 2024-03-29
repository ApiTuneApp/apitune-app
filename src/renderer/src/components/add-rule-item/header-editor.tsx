import { useState } from 'react'

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip
} from '@mui/material'
import { AddRuleValueProps } from '@renderer/common/contract'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'

import { HTTP_REQUEST_HEADER, HTTP_RESPONSE_HEADER } from '@shared/constants'

import RuleOutline from './rule-outline'

const ReqHeaders = HTTP_REQUEST_HEADER.map((item) => ({ label: item }))
const ResHeaders = HTTP_RESPONSE_HEADER.map((item) => ({ label: item }))

type HeaderItem = {
  type: 'add' | 'override' | 'remove'
  name: string
  value: string
}

type HeaderEditorProps = {
  type: 'request' | 'response'
}

function HeaderEditor({
  rule,
  setValue,
  type,
  setValid
}: AddRuleValueProps & HeaderEditorProps): JSX.Element {
  const [errorMsg, setErrorMsg] = useState('')
  const [headerList, setHeaderList] = useState<HeaderItem[]>([{ type: 'add', name: '', value: '' }])
  function validator(value: HeaderItem[]) {
    let valid = true
    if (value.length === 0) {
      valid = false
      setErrorMsg('Header rule is required')
    } else if (value.some((item) => !item.name || !item.value)) {
      valid = false
      setErrorMsg('Header name and value is required')
    } else {
      valid = true
      setErrorMsg('')
    }
    // rule.valid = valid
    setValid(valid)
  }

  rule.validator = validator

  function removeHeaderRule(index: number) {
    const list = headerList.filter((_, i) => i !== index)
    setHeaderList(list)
  }
  function addHeaderRule() {
    setHeaderList([...headerList, { type: 'add', name: '', value: '' }])
  }

  function handleChange(type: 'name' | 'value', value: string, index: number) {
    const list = headerList.map((item, i) => {
      if (i === index) {
        return { ...item, [type]: value }
      }
      return item
    })
    setHeaderList(list)
    setValue(list)
  }

  return (
    <RuleOutline
      title={`Modify ${type === 'request' ? 'Request' : 'Response'} Headers:`}
      WrapComponent={
        <Box>
          {headerList.map((item, index) => (
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }} key={index}>
              <Select defaultValue={'add'} size="small">
                <MenuItem value="add">Add</MenuItem>
                <MenuItem value="override">Override</MenuItem>
                <MenuItem value="remove">Remove</MenuItem>
              </Select>
              <Autocomplete
                size="small"
                freeSolo
                options={type === 'request' ? ReqHeaders : ResHeaders}
                sx={{ flex: 1 }}
                value={item.name}
                onChange={(_, value) => handleChange('name', value as string, index)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!item.name}
                    hiddenLabel
                    placeholder="Header Name"
                    onChange={(e) => handleChange('name', e.target.value, index)}
                  />
                )}
              />
              <TextField
                sx={{ flex: 1 }}
                hiddenLabel
                placeholder="Header Value"
                size="small"
                value={item.value}
                error={!item.value}
                onChange={(e) => handleChange('value', e.target.value, index)}
              />
              <Tooltip title="Remove" placement="right" arrow>
                <IconButton
                  size="small"
                  sx={{ width: '20px' }}
                  disableRipple
                  onClick={() => removeHeaderRule(index)}
                >
                  <CloseOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
          <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => addHeaderRule()}>
            Add New Header Rule
          </Button>
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

export default HeaderEditor
