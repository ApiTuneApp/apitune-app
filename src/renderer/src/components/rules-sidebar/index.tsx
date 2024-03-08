import './rules-sidebar.less'

import * as React from 'react'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMore from '@mui/icons-material/ExpandMore'
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import { Box, Divider, IconButton, Stack, Switch, Tooltip, Typography } from '@mui/material'
import { TreeItem, TreeItemProps, TreeView } from '@mui/x-tree-view'
import { NavLink } from 'react-router-dom'

type RuleTreeItemProps = TreeItemProps & {
  labelText: string
}

const RuleTreeItem = React.forwardRef(function RuleTreeItem(
  props: RuleTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { labelText, ...others } = props

  const handleSwitchClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    console.log('Switch clicked:', nodeId)
  }

  return (
    <TreeItem
      label={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          <Switch defaultChecked size="small" onClick={(e) => handleSwitchClick(e, props.nodeId)} />
        </Box>
      }
      ref={ref}
      {...others}
    />
  )
})

function RulesSidebar(): JSX.Element {
  return (
    <Box className="rules-sidebar" sx={{ backgroundColor: 'var(--color-background-mute)' }}>
      <Stack direction="row" alignItems="center" sx={{ p: 1 }}>
        <Tooltip title="Add Group" arrow>
          <IconButton sx={{ fontSize: 18 }}>
            <QueueOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Rule" arrow>
          <NavLink to="/rules/new">
            <IconButton sx={{ fontSize: 18 }}>
              <AddBoxOutlinedIcon fontSize="inherit" />
            </IconButton>
          </NavLink>
        </Tooltip>
      </Stack>
      <Divider />
      <TreeView
        aria-label="rules-tree"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ width: '100%', minWidth: '200px', overflowY: 'auto' }}
      >
        <RuleTreeItem nodeId="1" labelText="Group1" className="rule-item rule-group">
          <RuleTreeItem nodeId="1.1" labelText="rule1" className="rule-item" />
        </RuleTreeItem>
        <RuleTreeItem nodeId="2" labelText="Group2" className="rule-item rule-group">
          <RuleTreeItem nodeId="2.2" labelText="rule2" className="rule-item" />
        </RuleTreeItem>
      </TreeView>
    </Box>
  )
}

export default RulesSidebar