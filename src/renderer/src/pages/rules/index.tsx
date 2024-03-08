import { Box, Divider } from '@mui/material'
import RulesSidebar from '@renderer/components/rules-sidebar'
import { Outlet } from 'react-router-dom'

function RulesPage(): JSX.Element {
  return (
    <Box className="page-rules" sx={{ display: 'flex', height: '100%' }}>
      <RulesSidebar />
      <Divider
        orientation="vertical"
        flexItem
        sx={{ ':hover': { cursor: 'col-resize', borderWidth: '1px' } }}
      />
      <Box className="rules-content" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default RulesPage
