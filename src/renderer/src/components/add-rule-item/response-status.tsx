import { AutoComplete, Form } from 'antd'

import { AddRuleValueProps } from '@renderer/common/contract'
import { strings } from '@renderer/services/localization'
import { HTTP_STATUS_CODE } from '@shared/constants'

function ResponseStatus({ field }: AddRuleValueProps): JSX.Element {
  return (
    <Form.Item
      name={[field.name, 'value']}
      rules={[
        {
          required: true,
          message: strings.formatString(strings.status, strings.isRequired) as string
        }
      ]}
      label={strings.repStatus + ':'}
    >
      <AutoComplete
        options={HTTP_STATUS_CODE.map((option) => ({
          ...option,
          label: <li>{`${option.value} - ${option.label}`}</li>
        }))}
        allowClear
      />
    </Form.Item>
  )
}

export default ResponseStatus
