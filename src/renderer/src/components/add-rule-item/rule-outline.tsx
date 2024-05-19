import { Form } from 'antd'
import { ReactElement } from 'react'

type RuleOutlineProps = {
  title: string
  WrapComponent?: ReactElement
  children?: ReactElement
}

function RuleOutline({ title, children }: RuleOutlineProps) {
  return <Form.Item label={title}>{children}</Form.Item>
}

export default RuleOutline
