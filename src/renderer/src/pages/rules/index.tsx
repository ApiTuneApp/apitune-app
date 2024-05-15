import RulesSidebar from '@renderer/components/rules-sidebar'
import { Outlet } from 'react-router-dom'

import { Flex } from 'antd'

function RulesPage(): JSX.Element {
  return (
    <Flex className="page-rules" style={{ height: '100%' }}>
      <RulesSidebar />
      <div className="rules-content">
        <Outlet />
      </div>
    </Flex>
  )
}

export default RulesPage
