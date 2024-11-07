import { AutoComplete, Button, Flex, Form, FormListFieldData, Input, Select, Tooltip } from 'antd'
import { useState } from 'react'

import { CloseOutlined } from '@ant-design/icons'
import { AddRuleValueProps } from '@renderer/common/contract'
import { strings } from '@renderer/services/localization'
import { HTTP_REQUEST_HEADER, HTTP_RESPONSE_HEADER } from '@shared/constants'

const ReqHeaders = HTTP_REQUEST_HEADER.map((item) => {
  return { label: item, value: item }
})
const ResHeaders = HTTP_RESPONSE_HEADER.map((item) => {
  return { label: item, value: item }
})

type HeaderEditorProps = {
  type: 'request' | 'response'
  allowRemoveFrist?: boolean
}

function HeaderEditor({
  field,
  type,
  allowRemoveFrist,
  form
}: AddRuleValueProps & HeaderEditorProps): JSX.Element {
  const currentHeaderValues = form.getFieldValue(['modifyList', field.name, 'value'])
  const [typeMap, setTypeMap] = useState(
    currentHeaderValues
      ? Object.fromEntries(currentHeaderValues.map((item, index) => [index, item.type]))
      : {}
  )

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
            {strings.formatString(
              strings.modifyHeaders,
              type === 'request' ? strings.request : strings.response
            ) + ':'}
          </div>
          {fields.map((fd, index) => (
            <Flex gap={4} key={fd.key} align="baseline">
              <Form.Item name={[fd.name, 'type']} style={{ width: '110px' }}>
                <Select
                  options={[
                    { label: strings.add, value: 'add' },
                    { label: strings.override, value: 'override' },
                    { label: strings.remove, value: 'remove' }
                  ]}
                  onChange={(value) => handleTypeChange(fd, value)}
                />
              </Form.Item>
              <Form.Item
                name={[fd.name, 'name']}
                style={{ flex: 1 }}
                rules={[{ required: true, message: strings.headerNameRequired }]}
              >
                <AutoComplete options={type === 'request' ? ReqHeaders : ResHeaders} allowClear />
              </Form.Item>
              {typeMap[fd.name] !== 'remove' && (
                <Form.Item
                  name={[fd.name, 'value']}
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: strings.headerValueRquired }]}
                >
                  <Input />
                </Form.Item>
              )}
              {(index > 0 || allowRemoveFrist) && (
                <Tooltip title={strings.remove} arrow>
                  <CloseOutlined onClick={() => remove(index)} />
                </Tooltip>
              )}
              {index === 0 && <div style={{ width: 14 }}></div>}
            </Flex>
          ))}
          <Button
            type="dashed"
            block
            style={{ marginLeft: 4 }}
            onClick={() => add({ type: 'add', name: '', value: '' })}
          >
            {strings.addNewHeaderRule}
          </Button>
        </>
      )}
    </Form.List>
  )
}

export default HeaderEditor
