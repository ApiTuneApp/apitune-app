import './rules.less'

import { Flex } from 'antd'
import { Outlet } from 'react-router-dom'

import RulesSidebar from '@renderer/components/rules-sidebar'

function RulesPage(): JSX.Element {
  return (
    <Flex className="page-rules">
      <RulesSidebar />
      <div className="rules-content">
        <Outlet />
      </div>
    </Flex>
  )
}

export default RulesPage
