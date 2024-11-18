import { Button, Result } from 'antd'
import { ResultStatusType } from 'antd/es/result'
import { NavLink, useRouteError } from 'react-router-dom'

import { strings } from '@renderer/services/localization'

function ErrorPage(): JSX.Element {
  const error = useRouteError() as { data: string; status: number }
  console.log('error', error)
  return (
    <Result
      status={(error.status as ResultStatusType) || 'error'}
      title={error.status || strings.somethingWrong}
      subTitle={error.data}
      extra={
        <NavLink to={'/'}>
          <Button type="primary">{strings.backHome}</Button>
        </NavLink>
      }
    />
  )
}

export default ErrorPage
