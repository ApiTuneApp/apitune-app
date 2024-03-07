import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Box } from '@mui/material'
import { TreeItem, TreeView } from '@mui/x-tree-view'

import './rules-sidebar.less'

function RulesSidebar(): JSX.Element {
  return (
    <Box className="rules-sidebar" sx={{ backgroundColor: 'var(--color-background-mute)' }}>
      <TreeView
        aria-label="rules-tree"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ width: '100%', minWidth: '200px', overflowY: 'auto' }}
      >
        <TreeItem nodeId="1" label="Group1" className="rule-item rule-group">
          <TreeItem nodeId="2" label="rule1" className="rule-item" />
        </TreeItem>
        <TreeItem nodeId="5" label="Group2" className="rule-item rule-group">
          <TreeItem nodeId="10" label="rule2" className="rule-item" />
        </TreeItem>
      </TreeView>
    </Box>
  )
}

export default RulesSidebar
