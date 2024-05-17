import './rules-sidebar.less'

import { App, Button, Divider, Dropdown, Flex, Switch, Tooltip, Tree } from 'antd'
import * as React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import {
  ExclamationCircleFilled,
  FileOutlined,
  FolderAddOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusSquareOutlined
} from '@ant-design/icons'
import GroupEditModal from '@renderer/components/group-edit-modal'
import * as RuleService from '@renderer/services/rule'
import { useRuleStore } from '@renderer/store'
import { EventResultStatus, RuleData, RuleGroup } from '@shared/contract'
import { findGroupOrRule } from '@shared/utils'

import type { MenuProps, TreeDataNode, TreeProps } from 'antd'
type RuleTreeDataNode = TreeDataNode & {
  rule: RuleGroup | RuleData
}

type RuleTreeItemProps = {
  labelText: string
  rule: RuleGroup | RuleData
  onMenuClick: (key: string, rule: RuleGroup) => void
}

const RuleGroupDropdown: MenuProps['items'] = [
  {
    key: 'addRule',
    label: 'Add Rule'
  },
  {
    key: 'rename',
    label: 'Rename'
  },
  {
    key: 'delete',
    label: 'Delete'
  }
]

const RuleTreeItem = React.forwardRef(function RuleTreeItem(
  props: RuleTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { labelText, rule, onMenuClick, ...others } = props
  const [showMenu, setShowMenu] = React.useState(false)

  const handleSwitchClick = (e: React.MouseEvent, checked: boolean, ruleId: string) => {
    e.stopPropagation()
    window.api.enableRule(ruleId, checked).then((result) => {
      if (result.status === EventResultStatus.Success) {
        RuleService.getApiRules()
      }
    })
  }

  const handleHover = () => {
    if (rule.kind === 'group') {
      setShowMenu(true)
    }
  }

  const handleLeave = () => {
    setShowMenu(false)
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      ref={ref}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <div className="rule-name-block">
        {rule.kind === 'group' ? <FolderOutlined /> : <FileOutlined />}
        <span className="rule-name" style={{ marginLeft: '5px' }}>
          {labelText}
        </span>
      </div>
      {rule.kind === 'group' ? (
        <Dropdown
          menu={{ items: RuleGroupDropdown, onClick: (e) => onMenuClick(e.key, rule) }}
          trigger={['click']}
        >
          <a
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            style={{ display: showMenu ? 'inherit' : 'none' }}
          >
            <MoreOutlined />
          </a>
        </Dropdown>
      ) : (
        <Tooltip title={rule.enable ? 'Disable rule' : 'Enable rule'} arrow>
          <Switch
            size="small"
            checked={rule.enable}
            onClick={(checked, e) => handleSwitchClick(e, checked, rule.id)}
          />
        </Tooltip>
      )}
    </Flex>
  )
})

function RulesSidebar(): JSX.Element {
  const navigate = useNavigate()
  const { modal } = App.useApp()
  const apiRules = useRuleStore((state) => state.apiRules)
  const [addGroupDialogOpen, setAddGroupDialogOpen] = React.useState(false)
  const [editGroupId, setEditGroupId] = React.useState<string | null>(null)
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([])

  const treeData = React.useMemo<RuleTreeDataNode[]>(() => {
    return apiRules.map((rule) => {
      if (rule.kind === 'group') {
        return {
          key: rule.id,
          title: rule.name,
          rule,
          children: rule.ruleList?.map((r) => ({
            key: r.id,
            title: r.name,
            rule: r
          }))
        }
      } else {
        return {
          key: rule.id,
          title: rule.name,
          rule
        }
      }
    })
  }, [apiRules])

  const handleDelConfirmOpen = () => {
    modal.confirm({
      title: `Are you sure delete "${apiRules.find((r) => r.id === editGroupId)?.name}"?`,
      icon: <ExclamationCircleFilled />,
      content: 'Your will not be able to recover this rule group!',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDelConfirm()
      }
    })
  }
  const handleDelConfirm = async () => {
    const result = await window.api.deleteRule(editGroupId as string)
    if (result.status === EventResultStatus.Success) {
      RuleService.getApiRules()
    }
  }

  const handleGroupMenuItemClick = (key: string, rule: RuleGroup) => {
    const menuItem = key
    setEditGroupId(rule.id)
    if (menuItem === 'addRule') {
      navigate('/rules/new?groupId=' + rule.id)
    } else if (menuItem === 'rename') {
      setAddGroupDialogOpen(true)
    } else if (menuItem === 'delete') {
      handleDelConfirmOpen()
    }
  }

  const handleTreeSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    const key = info.node.key as string
    const rule = findGroupOrRule(apiRules, key)
    if (rule && rule.kind === 'rule') {
      navigate(`/rules/edit/${rule.id}`)
    } else {
      if (expandedKeys.includes(key)) {
        setExpandedKeys(expandedKeys.filter((k) => k !== key))
      } else {
        setExpandedKeys([...expandedKeys, key])
      }
    }
  }

  const onExpand = (_, { node }) => {
    const key = node.key as string
    if (expandedKeys.includes(key)) {
      setExpandedKeys(expandedKeys.filter((k) => k !== key))
    } else {
      setExpandedKeys([...expandedKeys, key])
    }
  }

  return (
    <div className="rules-sidebar">
      <Flex align="center" gap="small" style={{ paddingTop: 4 }}>
        <Tooltip title="Add Group" arrow>
          <Button
            type="text"
            icon={<FolderAddOutlined />}
            onClick={() => setAddGroupDialogOpen(true)}
          />
        </Tooltip>
        <Tooltip title="Add Rule" arrow>
          <NavLink to="/rules/new">
            <Button type="text" icon={<PlusSquareOutlined />} />
          </NavLink>
        </Tooltip>
      </Flex>
      <Divider style={{ margin: '5px 0' }} />
      <GroupEditModal
        open={addGroupDialogOpen}
        groupId={editGroupId}
        onClose={() => setAddGroupDialogOpen(false)}
      />
      <Tree
        className="rules-tree"
        style={{ width: '100%', minWidth: '200px', overflowY: 'auto' }}
        treeData={treeData}
        blockNode={true}
        expandedKeys={expandedKeys}
        titleRender={(nodeData) => {
          return (
            <RuleTreeItem
              key={nodeData.key}
              labelText={nodeData.title as string}
              rule={nodeData.rule as RuleGroup | RuleData}
              onMenuClick={handleGroupMenuItemClick}
            />
          )
        }}
        onSelect={handleTreeSelect}
        onExpand={onExpand}
      />
    </div>
  )
}

export default RulesSidebar
