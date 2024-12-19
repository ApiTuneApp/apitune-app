import { Button, Result, Typography } from 'antd'
import { ResultStatusType } from 'antd/es/result'
import { NavLink, useRouteError } from 'react-router-dom'

import { strings } from '@renderer/services/localization'

const { Paragraph, Text } = Typography

function ErrorPage(): JSX.Element {
  const error = useRouteError() as {
    data: string
    status: number
    statusText?: string
    message?: string
    stack?: string
  }

  console.log('error', error)

  const errorDetails = [
    { label: 'Status', value: error.status },
    { label: 'Status Text', value: error.statusText },
    { label: 'Message', value: error.message || error.data },
    { label: 'Stack Trace', value: error.stack }
  ].filter((detail) => detail.value)

  return (
    <Result
      status={(error.status as ResultStatusType) || 'error'}
      title={error.status || strings.somethingWrong}
      subTitle={error.statusText || error.data}
      extra={[
        <div key="error-details" style={{ textAlign: 'left', marginBottom: 24 }}>
          {errorDetails.map((detail, index) => (
            <Paragraph key={index}>
              <Text strong>{detail.label}: </Text>
              <Text>{detail.value}</Text>
            </Paragraph>
          ))}
        </div>,
        <NavLink to={'/'} key="home-button">
          <Button type="primary">{strings.backHome}</Button>
        </NavLink>
      ]}
    />
  )
}

export default ErrorPage
