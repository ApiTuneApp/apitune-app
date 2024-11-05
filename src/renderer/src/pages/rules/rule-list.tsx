import './rules.less'

import { App, Button, Space, Switch, Table, Tooltip } from 'antd'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

import { ExclamationCircleFilled, ShareAltOutlined } from '@ant-design/icons'
import GroupEditModal from '@renderer/components/group-edit-modal'
import * as Service from '@renderer/services'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { ApiRuleItem, EventResultStatus, RuleData, RuleGroup } from '@shared/contract'

import type { TableProps } from 'antd'
import { findGroupOrRule, findParentGroup } from '@shared/utils'

function RuleListPage(): JSX.Element {
  const { modal } = App.useApp()
  const apiRules = useRuleStore((state) => state.apiRules)
  const [editGroupId, setEditGroupId] = React.useState<string | null>(null)
  const [groupNameModalOpen, setGroupNameModalOpen] = React.useState(false)

  function triggerRuleEnable(rule, enabled) {
    window.api.enableRule(rule.id, enabled).then((result) => {
      if (result.status === EventResultStatus.Success) {
        Service.getApiRules()
      }
    })
  }

  function handleGroupRename(groupId) {
    setEditGroupId(groupId)
    setGroupNameModalOpen(true)
  }

  function handleShare(ruleId) {
    console.log('handleShare', ruleId)
  }

  const handleDelConfirmOpen = (id: string) => {
    const curRule = findGroupOrRule(apiRules, id)
    modal.confirm({
      title: strings.formatString(strings.deleteTitle, curRule!.name),
      icon: <ExclamationCircleFilled />,
      content: strings.formatString(
        strings.deleteDesc,
        curRule!.kind === 'group' ? strings.group : strings.rule
      ),
      okText: strings.yes,
      okType: 'danger',
      cancelText: strings.no,
      onOk: async () => {
        const result = await window.api.deleteRule(id)
        if (result.status === EventResultStatus.Success) {
          Service.getApiRules()
        }
      }
    })
  }

  const groupColumns: TableProps<ApiRuleItem>['columns'] = [
    {
      title: strings.ruleGroupName,
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: strings.description,
      dataIndex: 'enable',
      key: 'enable',
      render: (enable, rule) => {
        return (
          <Switch
            checked={enable}
            size="small"
            onChange={(checked) => triggerRuleEnable(rule, checked)}
          />
        )
      }
    },
    {
      title: strings.updatedOn,
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (updateTime) => {
        return new Date(updateTime).toLocaleString()
      }
    },
    {
      title: strings.actions,
      key: 'actions',
      render: (text, record) => {
        return (
          <Space size="middle">
            <Button icon={<ShareAltOutlined />} onClick={(e) => handleShare(record.id)}></Button>
            <Button onClick={(e) => handleGroupRename(record.id)}>{strings.rename}</Button>
            <Button danger onClick={(e) => handleDelConfirmOpen(record.id)}>
              {strings.delete}
            </Button>
          </Space>
        )
      }
    }
  ]

  const ruleColumns: TableProps<RuleData>['columns'] = [
    {
      title: strings.ruleName,
      dataIndex: 'name',
      key: 'name',
      render: (_, r) => {
        return <NavLink to={`/rules/edit/${r.id}`}>{r.name}</NavLink>
      }
    },
    {
      title: strings.description,
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: strings.ruleEnabled,
      dataIndex: 'enable',
      key: 'enable',
      render: (enable, rule) => {
        const ruleGroup = findParentGroup(apiRules, rule.id)
        if (ruleGroup && !ruleGroup.enable) {
          return (
            <Tooltip title="The rule group is disabled. Please enable it first." arrow>
              <Switch checked={enable} size="small" disabled />
            </Tooltip>
          )
        }
        return (
          <Switch
            checked={enable}
            size="small"
            onChange={(checked) => triggerRuleEnable(rule, checked)}
          />
        )
      }
    },
    {
      title: strings.updatedOn,
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (updateTime) => {
        return new Date(updateTime).toLocaleString()
      }
    },
    {
      title: strings.actions,
      key: 'actions',
      render: (text, record) => {
        return (
          <Space size="middle">
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={(e) => handleShare(record.id)}
            ></Button>
            <Button type="text" danger onClick={(e) => handleDelConfirmOpen(record.id)}>
              {strings.delete}
            </Button>
          </Space>
        )
      }
    }
  ]

  return (
    <div className="page-rule-list">
      <Table
        rowKey="id"
        dataSource={apiRules}
        columns={groupColumns}
        pagination={false}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <Table
                rowKey="id"
                dataSource={(record as RuleGroup).ruleList}
                columns={ruleColumns}
                pagination={false}
              ></Table>
            )
          },
          rowExpandable: (record) => record.kind === 'group' && record.ruleList.length > 0
        }}
      ></Table>
      <GroupEditModal
        open={groupNameModalOpen}
        groupId={editGroupId}
        onClose={() => setGroupNameModalOpen(false)}
      />
    </div>
  )
}

export default RuleListPage
