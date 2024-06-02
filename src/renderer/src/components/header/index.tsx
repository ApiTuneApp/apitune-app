import './header.less'

import { Typography } from 'antd'

const { Text } = Typography

function Header(): JSX.Element {
  return (
    <div className="app-header">
      <Text>My Workspace</Text>
    </div>
  )
}

export default Header
