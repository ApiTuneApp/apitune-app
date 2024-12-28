import './rules-sidebar.less'

import { App, Button, Dropdown, Empty, Flex, Switch, Tooltip, Tree } from 'antd'
import * as React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import {
  ExclamationCircleFilled,
  FileOutlined,
  FolderAddOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusSquareOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons'
import GroupEditModal from '@renderer/components/group-edit-modal'
import * as Service from '@renderer/services'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { useUserStore } from '@renderer/store/user'
import { useUxStore } from '@renderer/store/ux'
import { MAX_FREE_RULES } from '@shared/constants'
import { EventResultStatus, RenderEvent, RuleData, RuleGroup } from '@shared/contract'
import {
  checkSubscriptionActive,
  findGroupOrRule,
  findParentGroup,
  findRuleCount
} from '@shared/utils'

import type { MenuProps, TreeDataNode, TreeProps } from 'antd'
type RuleTreeDataNode = TreeDataNode & {
  rule: RuleGroup | RuleData
}

type RuleTreeItemProps = {
  labelText: string
  rule: RuleGroup | RuleData
  onMenuClick: (key: string, rule: RuleGroup) => void
}

const RuleTreeItem = React.forwardRef(function RuleTreeItem(
  props: RuleTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { labelText, rule, onMenuClick, ...others } = props
  const [showMenu, setShowMenu] = React.useState(false)
  const apiRules = useRuleStore((state) => state.apiRules)

  const RuleGroupDropdown: MenuProps['items'] = [
    {
      key: 'ruleGroupEnable',
      label: strings.enableGroup
    },
    {
      key: 'addRule',
      label: strings.addRule
    },
    {
      key: 'rename',
      label: strings.rename
    },
    {
      key: 'delete',
      label: strings.delete,
      danger: true
    }
  ]

  if (rule.kind === 'group') {
    ;(
      RuleGroupDropdown[0] as {
        key: string
        label: string
      }
    ).label = !rule.enable ? strings.enableGroup : strings.disableGroup
  }

  const parentGroup = findParentGroup(apiRules, rule.id)
  let ruleGroupEnable = true
  if (parentGroup) {
    ruleGroupEnable = parentGroup.enable
  }

  const handleSwitchClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    checked: boolean,
    ruleId: string
  ) => {
    e.stopPropagation()
    window.api.enableRule(ruleId, checked).then((result) => {
      if (result.status === EventResultStatus.Success) {
        Service.getApiRules(RenderEvent.EnableRule)
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
        <Tooltip
          title={
            ruleGroupEnable
              ? rule.enable
                ? strings.disableRule
                : strings.enableRule
              : strings.disableTooltip
          }
          arrow
        >
          <Switch
            size="small"
            disabled={!ruleGroupEnable}
            checked={rule.enable}
            onClick={(checked, e) =>
              handleSwitchClick(e as React.MouseEvent<HTMLButtonElement>, checked, rule.id)
            }
          />
        </Tooltip>
      )}
    </Flex>
  )
})

function RulesSidebar(): JSX.Element {
  const navigate = useNavigate()
  const { modal } = App.useApp()
  const { undo, redo, apiRules, undoRedoStack } = useRuleStore((state) => state)
  const { subscription } = useUserStore((state) => state)
  const [addGroupDialogOpen, setAddGroupDialogOpen] = React.useState(false)
  const [editGroupId, setEditGroupId] = React.useState<string | null>(null)
  const ruleSidebarExpandedKeys = useUxStore((state) => state.ruleSidebarExpandedKeys)
  const setRuleSidebarExpandedKeys = useUxStore((state) => state.setRuleSidebarExpandedKeys)

  const isProUser = checkSubscriptionActive(subscription)
  const canUndo = undoRedoStack.undo.length > 0
  const canRedo = undoRedoStack.redo.length > 0

  function checkSubscription() {
    if (
      !subscription &&
      !checkSubscriptionActive(subscription) &&
      findRuleCount(apiRules) >= MAX_FREE_RULES
    ) {
      modal.confirm({
        title: strings.subscriptionRequired,
        content: strings.formatString(strings.subscriptionRequiredDesc, MAX_FREE_RULES),
        okText: strings.upgradeToPro,
        onOk: () => {
          window.api.openExternal('https://apitune.io/#Pricing')
        }
      })
      return false
    }
    return true
  }

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

  const handleDelConfirmOpen = (groupId: string) => {
    modal.confirm({
      title: strings.formatString(
        strings.deleteTitle,
        apiRules.find((r) => r.id === groupId)!.name
      ),
      icon: <ExclamationCircleFilled />,
      content: strings.formatString(strings.deleteDesc, strings.group),
      okText: strings.yes,
      okType: 'danger',
      cancelText: strings.no,
      onOk() {
        handleDelConfirm(groupId)
      }
    })
  }
  const handleDelConfirm = async (groupId: string) => {
    const result = await window.api.deleteRule(groupId as string)
    if (result.status === EventResultStatus.Success) {
      Service.getApiRules(RenderEvent.DeleteRule)
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
      handleDelConfirmOpen(rule.id)
    } else if (menuItem === 'ruleGroupEnable') {
      window.api.enableRule(rule.id, !rule.enable).then((result) => {
        if (result.status === EventResultStatus.Success) {
          Service.getApiRules(RenderEvent.EnableRule)
        }
      })
    }
  }

  const handleTreeSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    const key = info.node.key as string
    const rule = findGroupOrRule(apiRules, key)
    if (rule && rule.kind === 'rule') {
      navigate(`/rules/edit/${rule.id}`)
    } else {
      if (ruleSidebarExpandedKeys.includes(key)) {
        setRuleSidebarExpandedKeys(ruleSidebarExpandedKeys.filter((k) => k !== key))
      } else {
        setRuleSidebarExpandedKeys([...ruleSidebarExpandedKeys, key])
      }
    }
  }

  const onExpand = (_, { node }) => {
    const key = node.key as string
    if (ruleSidebarExpandedKeys.includes(key)) {
      setRuleSidebarExpandedKeys(ruleSidebarExpandedKeys.filter((k) => k !== key))
    } else {
      setRuleSidebarExpandedKeys([...ruleSidebarExpandedKeys, key])
    }
  }

  const handleAddGroup = () => {
    setEditGroupId(null)
    setAddGroupDialogOpen(true)
  }

  const handleAddRule = () => {
    if (checkSubscription()) {
      navigate('/rules/new')
    }
  }

  const handleUndo = () => {
    if (!isProUser) {
      modal.confirm({
        title: strings.subscriptionRequired,
        content: strings.subcriptionFeature,
        okText: strings.upgradeToPro,
        onOk: () => {
          window.api.openExternal('https://apitune.io/#Pricing')
        }
      })
    } else if (canUndo) {
      undo()
      const latestRules = useRuleStore.getState().apiRules
      window.api.saveRules(latestRules)
    }
  }

  const handleRedo = () => {
    if (!isProUser) {
      modal.confirm({
        title: strings.subscriptionRequired,
        content: strings.subcriptionFeature,
        okText: strings.upgradeToPro,
        onOk: () => {
          window.api.openExternal('https://apitune.io/#Pricing')
        }
      })
    } else if (canRedo) {
      redo()
      const latestRules = useRuleStore.getState().apiRules
      window.api.saveRules(latestRules)
    }
  }

  return (
    <div className="rules-sidebar">
      <Flex align="center" gap="small" style={{ paddingTop: 4 }}>
        <Tooltip title={strings.addGroup} arrow overlayClassName="j-autohide-tooltip">
          <Button type="text" icon={<FolderAddOutlined />} onClick={() => handleAddGroup()} />
        </Tooltip>
        <Tooltip title={strings.addRule} arrow overlayClassName="j-autohide-tooltip">
          <Button type="text" icon={<PlusSquareOutlined />} onClick={() => handleAddRule()} />
        </Tooltip>
        <Tooltip title={strings.goGroupList} arrow overlayClassName="j-autohide-tooltip">
          <NavLink to="/rules/list">
            <Button type="text" icon={<UnorderedListOutlined />} />
          </NavLink>
        </Tooltip>
        <Tooltip title={strings.undo} arrow overlayClassName="j-autohide-tooltip">
          <Button type="text" icon={<UndoOutlined />} onClick={handleUndo} disabled={!canUndo} />
        </Tooltip>
        <Tooltip title={strings.redo} arrow overlayClassName="j-autohide-tooltip">
          <Button type="text" icon={<RedoOutlined />} onClick={handleRedo} disabled={!canRedo} />
        </Tooltip>
      </Flex>
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
        expandedKeys={ruleSidebarExpandedKeys}
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
      {apiRules.length === 0 && (
        <Empty style={{ marginTop: 100 }}>
          <Button type="primary" onClick={() => handleAddRule()}>
            {strings.addRule}
          </Button>
        </Empty>
      )}
    </div>
  )
}

export default RulesSidebar
