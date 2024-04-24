import './rules-sidebar.less'

import * as React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMore from '@mui/icons-material/ExpandMore'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined'
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
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { TreeItem, TreeItemProps, TreeView } from '@mui/x-tree-view'
import ConfirmDialog from '@renderer/components/confirm-dialog'
import * as RuleService from '@renderer/services/rule'
import { useRuleStore } from '@renderer/store'
import { EventResultStatus, RuleData, RuleGroup } from '@shared/contract'

type RuleTreeItemProps = TreeItemProps & {
  labelText: string
  rule: RuleGroup | RuleData
  onMenuClick?: (event: React.MouseEvent<HTMLElement>) => void
}

const RuleTreeItem = React.forwardRef(function RuleTreeItem(
  props: RuleTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const navigate = useNavigate()
  const { labelText, rule, onMenuClick, ...others } = props

  const handleSwitchClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
  }

  const handleTreeItemClick = (rule: RuleGroup | RuleData) => {
    if (rule.kind === 'rule') {
      navigate('/rules/edit/' + rule.id)
    }
  }

  return (
    <TreeItem
      label={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {rule.kind === 'group' ? (
            <FolderOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          ) : undefined}
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          {rule.kind === 'group' ? (
            <IconButton
              size="small"
              data-rule-id={rule.id}
              onClick={(e) => {
                e.stopPropagation()
                onMenuClick && onMenuClick(e)
              }}
            >
              <MoreHorizOutlinedIcon fontSize="small" />
            </IconButton>
          ) : (
            <Switch
              defaultChecked
              size="small"
              onClick={(e) => handleSwitchClick(e, props.nodeId)}
            />
          )}
        </Box>
      }
      onClick={(e) => handleTreeItemClick(rule)}
      ref={ref}
      {...others}
    />
  )
})

function RulesSidebar(): JSX.Element {
  const navigate = useNavigate()
  const apiRules = useRuleStore((state) => state.apiRules)
  const [addGroupDialogOpen, setAddGroupDialogOpen] = React.useState(false)
  const handleAddGroupClose = () => {
    setAddGroupDialogOpen(false)
    setEditGroupId(null)
  }
  const handelAddGroupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries((formData as any).entries())
    const ruleGroupName = formJson.ruleGroupName
    if (editGroupId) {
      const result = await window.api.updateRuleGroupName(editGroupId, ruleGroupName)
      if (result.status === EventResultStatus.Success) {
        RuleService.getApiRules()
      }
    } else {
      const result = await window.api.addRule(
        JSON.stringify({ kind: 'group', name: ruleGroupName, rules: [] })
      )
      if (result.status === EventResultStatus.Success) {
        RuleService.getApiRules()
      }
    }
    handleAddGroupClose()
  }

  const [ruleGroupMenuAnchorEl, setRuleGroupMenuAnchorEl] = React.useState<null | HTMLElement>(null)
  const groupMenuOpen = Boolean(ruleGroupMenuAnchorEl)
  const handleGroupMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setRuleGroupMenuAnchorEl(event.currentTarget)
  }
  const handleGroupMenuClose = () => {
    setRuleGroupMenuAnchorEl(null)
  }

  const [delConfirmOpen, setDelConfirmOpen] = React.useState(false)
  const handleDelConfirmClose = () => {
    setDelConfirmOpen(false)
  }
  const handleDelConfirmOpen = () => {
    setDelConfirmOpen(true)
  }
  const handleDelConfirm = async () => {
    const result = await window.api.deleteRule(editGroupId as string)
    if (result.status === EventResultStatus.Success) {
      RuleService.getApiRules()
    }
    handleDelConfirmClose()
  }

  const handleGroupMenuItemClick = (event: React.MouseEvent<HTMLElement>) => {
    const menuItem = event.currentTarget.textContent
    const gId = (ruleGroupMenuAnchorEl as HTMLElement).getAttribute('data-rule-id')
    setEditGroupId(gId)
    if (menuItem === 'Add Rule') {
      navigate('/rules/new?groupId=' + gId)
    } else if (menuItem === 'Rename') {
      setAddGroupDialogOpen(true)
    } else if (menuItem === 'Delete') {
      handleDelConfirmOpen()
    }
    handleGroupMenuClose()
  }

  const [editGroupId, setEditGroupId] = React.useState<string | null>(null)

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
        <DialogTitle>{editGroupId ? 'Edit' : 'New'} Rule Group Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="addRuleGroup"
            name="ruleGroupName"
            hiddenLabel
            defaultValue={editGroupId ? apiRules.find((r) => r.id === editGroupId)?.name : ''}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddGroupClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      <Menu
        id="ruleGroupMenu"
        anchorEl={ruleGroupMenuAnchorEl}
        open={groupMenuOpen}
        onClose={handleGroupMenuClose}
        MenuListProps={{
          'aria-labelledby': 'rule-group-button'
        }}
      >
        <MenuItem onClick={handleGroupMenuItemClick}>Add Rule</MenuItem>
        <MenuItem onClick={handleGroupMenuItemClick}>Rename</MenuItem>
        <MenuItem onClick={handleGroupMenuItemClick}>Delete</MenuItem>
      </Menu>
      <ConfirmDialog
        title={`Delete "${apiRules.find((r) => r.id === editGroupId)?.name}"?`}
        content="Your will not be able to recover this rule group!"
        open={delConfirmOpen}
        onClose={handleDelConfirmClose}
        onConfirm={handleDelConfirm}
      />
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
                rule={rule}
                className="rule-item rule-group"
                onMenuClick={handleGroupMenuClick}
              >
                {rule.rules &&
                  rule.rules.map((r) => (
                    <RuleTreeItem
                      key={r.id}
                      nodeId={r.id}
                      labelText={r.name}
                      rule={r}
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
                rule={rule}
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
