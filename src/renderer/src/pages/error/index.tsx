import { Button, Result } from 'antd'
import { NavLink, useRouteError } from 'react-router-dom'

function ErrorPage(): JSX.Element {
  // const error = useRouteError()
  // console.log('error', error)
  return (
    <Result
      status="error"
      title="Oops! Something went wrong with your operation."
      extra={
        <NavLink to={'/'}>
          <Button type="primary">Back Homepage</Button>
        </NavLink>
      }
    />
  )
}

export default ErrorPage
