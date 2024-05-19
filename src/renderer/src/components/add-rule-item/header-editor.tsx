import { useState } from 'react'

import { IconButton } from '@mui/material'
import { AddRuleValueProps } from '@renderer/common/contract'

import { HeaderItem } from '@shared/contract'
import { HTTP_REQUEST_HEADER, HTTP_RESPONSE_HEADER } from '@shared/constants'
import { AutoComplete, Button, Input, Form, Flex, Select, Tooltip } from 'antd'

import { CloseOutlined } from '@ant-design/icons'

const ReqHeaders = HTTP_REQUEST_HEADER.map((item) => {
  return { label: item, value: item }
})
const ResHeaders = HTTP_RESPONSE_HEADER.map((item) => {
  return { label: item, value: item }
})

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
  const [headerList, setHeaderList] = useState<HeaderItem[]>(
    (rule.value as HeaderItem[]) || [{ type: 'add', name: '', value: '' }]
  )
  function validator(value: HeaderItem[]) {
    let valid = true
    if (value.length === 0) {
      valid = false
      setErrorMsg('Header rule is required')
    } else if (value.some((item) => !item.name || (item.type !== 'remove' && !item.value))) {
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

  function handleChange(type: 'type' | 'name' | 'value', value: string, index: number) {
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
    // <RuleOutline
    //   title={`Modify ${type === 'request' ? 'Request' : 'Response'} Headers:`}
    //   WrapComponent={
    //     <Box>
    //       {headerList.map((item, index) => (
    //         <Box sx={{ display: 'flex', gap: 1, mb: 1 }} key={index}>
    //           <Select
    //             value={item.type}
    //             size="small"
    //             onChange={(e) => handleChange('type', e.target.value, index)}
    //           >
    //             <MenuItem value="add">Add</MenuItem>
    //             <MenuItem value="override">Override</MenuItem>
    //             <MenuItem value="remove">Remove</MenuItem>
    //           </Select>
    //           <Autocomplete
    //             size="small"
    //             freeSolo
    //             options={type === 'request' ? ReqHeaders : ResHeaders}
    //             sx={{ flex: 1 }}
    //             value={item.name}
    //             onChange={(_, value) => handleChange('name', value as string, index)}
    //             renderInput={(params) => (
    //               <TextField
    //                 {...params}
    //                 error={!item.name}
    //                 hiddenLabel
    //                 placeholder="Header Name"
    //                 onChange={(e) => handleChange('name', e.target.value, index)}
    //               />
    //             )}
    //           />
    //           {item.type !== 'remove' && (
    //             <TextField
    //               sx={{ flex: 1 }}
    //               hiddenLabel
    //               placeholder="Header Value"
    //               size="small"
    //               value={item.value}
    //               error={!item.value}
    //               onChange={(e) => handleChange('value', e.target.value, index)}
    //             />
    //           )}
    //           <Tooltip title="Remove" placement="right" arrow>
    //             <IconButton
    //               size="small"
    //               sx={{ width: '20px' }}
    //               disableRipple
    //               onClick={() => removeHeaderRule(index)}
    //             >
    //               <CloseOutlinedIcon fontSize="small" />
    //             </IconButton>
    //           </Tooltip>
    //         </Box>
    //       ))}
    //       <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => addHeaderRule()}>
    //         Add New Header Rule
    //       </Button>
    //       {errorMsg && (
    //         <FormHelperText error sx={{ mt: 1 }}>
    //           {errorMsg}
    //         </FormHelperText>
    //       )}
    //     </Box>
    //   }
    // />
    <Form.Item
      name={rule.type}
      rules={[]}
      label={`Modify ${type === 'request' ? 'Request' : 'Response'} Headers:`}
    >
      <div>
        {headerList.map((item, index) => (
          <Flex gap={4} key={index} style={{ marginBottom: 1 }}>
            <Select
              value={item.type}
              style={{ width: '100px' }}
              options={[
                { label: 'Add', value: 'add' },
                { label: 'Override', value: 'override' },
                { label: 'Remove', value: 'remove' }
              ]}
              onChange={(value) => handleChange('type', value, index)}
            />
            <AutoComplete
              options={type === 'request' ? ReqHeaders : ResHeaders}
              style={{ flex: 1 }}
              value={item.name}
            />
            {item.type !== 'remove' && <Input style={{ flex: 1 }} value={item.value} />}
            <Tooltip title="Remove" arrow>
              <CloseOutlined
                onClick={() => removeHeaderRule(index)}
                style={{ width: 24, display: 'flex', justifyContent: 'space-around' }}
              />
            </Tooltip>
          </Flex>
        ))}
      </div>
      <Button type="dashed" style={{ marginTop: 4 }} onClick={() => addHeaderRule()}>
        Add New Header Rule
      </Button>
    </Form.Item>
  )
}

export default HeaderEditor
