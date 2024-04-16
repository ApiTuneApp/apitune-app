import './rules-sidebar.less'

import * as React from 'react'
import { NavLink } from 'react-router-dom'

import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMore from '@mui/icons-material/ExpandMore'
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { TreeItem, TreeItemProps, TreeView } from '@mui/x-tree-view'
import { useStore } from '@renderer/store'
import { EventResultStatus, RenderEvent } from '@shared/contract'
import { getApiRules } from '@renderer/services/rule'

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
  const apiRules = useStore((state) => state.apiRules)
  const [addGroupDialogOpen, setAddGroupDialogOpen] = React.useState(false)
  const handleAddGroupClose = () => setAddGroupDialogOpen(false)
  const handelAddGroupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries((formData as any).entries())
    const ruleGroupName = formJson.ruleGroupName
    const result = await window.api.addRule(
      JSON.stringify({ kind: 'group', name: ruleGroupName, rules: [] })
    )
    if (result.status === EventResultStatus.Success) {
      getApiRules()
    }
    handleAddGroupClose()
  }

  return (
    <Box className="rules-sidebar" sx={{ backgroundColor: 'var(--color-background-mute)' }}>
      <Stack direction="row" alignItems="center" sx={{ p: 1 }}>
        <Tooltip title="Add Group" arrow>
          <IconButton sx={{ fontSize: 18 }} onClick={() => setAddGroupDialogOpen(true)}>
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
      <Dialog
        fullWidth={true}
        open={addGroupDialogOpen}
        onClose={() => handleAddGroupClose()}
        maxWidth="xs"
        PaperProps={{
          component: 'form',
          onSubmit: handelAddGroupSubmit
        }}
      >
        <DialogTitle>New Rule Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="addRuleGroup"
            name="ruleGroupName"
            label="Add Rule Group Name"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddGroupClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      <TreeView
        aria-label="rules-tree"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ width: '100%', minWidth: '200px', overflowY: 'auto' }}
      >
        {apiRules.map((rule) => {
          if (rule.kind === 'group') {
            return (
              <RuleTreeItem
                key={rule.id}
                nodeId={rule.id}
                labelText={rule.name}
                className="rule-item rule-group"
              >
                {rule.rules &&
                  rule.rules.map((r) => (
                    <RuleTreeItem
                      key={r.id}
                      nodeId={r.id}
                      labelText={r.name}
                      className="rule-item"
                    />
                  ))}
              </RuleTreeItem>
            )
          } else {
            return (
              <RuleTreeItem
                key={rule.id}
                nodeId={rule.id}
                labelText={rule.name}
                className="rule-item"
              />
            )
          }
        })}
      </TreeView>
    </Box>
  )
}

export default RulesSidebar
