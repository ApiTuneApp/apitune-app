import { AutoComplete, Button, Flex, Form, FormListFieldData, Input, Select, Tooltip } from 'antd'
import { useState } from 'react'

import { CloseOutlined } from '@ant-design/icons'
import { AddRuleValueProps } from '@renderer/common/contract'
import { HTTP_REQUEST_HEADER, HTTP_RESPONSE_HEADER } from '@shared/constants'

const ReqHeaders = HTTP_REQUEST_HEADER.map((item) => {
  return { label: item, value: item }
})
const ResHeaders = HTTP_RESPONSE_HEADER.map((item) => {
  return { label: item, value: item }
})

type HeaderEditorProps = {
  type: 'request' | 'response'
}

function HeaderEditor({ field, type }: AddRuleValueProps & HeaderEditorProps): JSX.Element {
  const [typeMap, setTypeMap] = useState({})

  function handleTypeChange(field: FormListFieldData, value: string) {
    setTypeMap((prev) => {
      return { ...prev, [field.name]: value }
    })
  }

  return (
    <Form.List name={[field.name, 'value']}>
      {(fields, { add, remove }) => (
        <>
          <div className="ant-form-item-label" style={{ margin: 8 }}>
            {`Modify ${type === 'request' ? 'Request' : 'Response'} Headers:`}
          </div>
          {fields.map((field, index) => (
            <Flex gap={4} key={field.key} align="baseline">
              <Form.Item name={[field.name, 'type']} style={{ width: '110px' }}>
                <Select
                  options={[
                    { label: 'Add', value: 'add' },
                    { label: 'Override', value: 'override' },
                    { label: 'Remove', value: 'remove' }
                  ]}
                  onChange={(value) => handleTypeChange(field, value)}
                />
              </Form.Item>
              <Form.Item
                name={[field.name, 'name']}
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Header name is required' }]}
              >
                <AutoComplete options={type === 'request' ? ReqHeaders : ResHeaders} allowClear />
              </Form.Item>
              {typeMap[field.name] !== 'remove' && (
                <Form.Item
                  name={[field.name, 'value']}
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: 'Header value is required' }]}
                >
                  <Input />
                </Form.Item>
              )}
              {index > 0 && (
                <Tooltip title="Remove" arrow>
                  <CloseOutlined onClick={() => remove(index)} />
                </Tooltip>
              )}
              {index === 0 && <div style={{ width: 14 }}></div>}
            </Flex>
          ))}
          <Button
            size="small"
            type="dashed"
            block
            style={{ marginLeft: 4 }}
            onClick={() => add({ type: 'add', name: '', value: '' })}
          >
            Add New Header Rule
          </Button>
        </>
      )}
    </Form.List>
  )
}

export default HeaderEditor
