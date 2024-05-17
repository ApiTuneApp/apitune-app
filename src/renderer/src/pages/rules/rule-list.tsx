import * as React from 'react'
import './rules.less'

import GroupEditModal from '@renderer/components/group-edit-modal'
import * as RuleService from '@renderer/services/rule'
import { useRuleStore } from '@renderer/store'
import { ApiRuleItem, EventResultStatus, RuleData, RuleGroup } from '@shared/contract'

import { ExclamationCircleFilled } from '@ant-design/icons'
import type { TableProps } from 'antd'
import { App, Button, Space, Switch, Table } from 'antd'
import { NavLink } from 'react-router-dom'

function RuleListPage(): JSX.Element {
  const { modal } = App.useApp()
  const apiRules = useRuleStore((state) => state.apiRules)
  const [editGroupId, setEditGroupId] = React.useState<string | null>(null)
  const [groupNameModalOpen, setGroupNameModalOpen] = React.useState(false)

  function triggerRuleEnable(rule, enabled) {
    window.api.enableRule(rule.id, enabled).then((result) => {
      if (result.status === EventResultStatus.Success) {
        RuleService.getApiRules()
      }
    })
  }

  function handleGroupRename(groupId) {
    setEditGroupId(groupId)
    setGroupNameModalOpen(true)
  }

  const handleDelConfirmOpen = (editGroupId) => {
    modal.confirm({
      title: `Are you sure delete "${apiRules.find((r) => r.id === editGroupId)?.name}"?`,
      icon: <ExclamationCircleFilled />,
      content: 'Your will not be able to recover this rule group!',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        const result = await window.api.deleteRule(editGroupId as string)
        if (result.status === EventResultStatus.Success) {
          RuleService.getApiRules()
        }
      }
    })
  }

  const groupColumns: TableProps<ApiRuleItem>['columns'] = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Group Enabled',
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
      title: 'Updated on',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (updateTime) => {
        return new Date(updateTime).toLocaleString()
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => {
        return (
          <Space size="middle">
            <Button onClick={(e) => handleGroupRename(record.id)}>Rename</Button>
            <Button danger onClick={(e) => handleDelConfirmOpen(record.id)}>
              Delete
            </Button>
          </Space>
        )
      }
    }
  ]

  const ruleColumns: TableProps<RuleData>['columns'] = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, r) => {
        return <NavLink to={`/rules/edit/${r.id}`}>{r.name}</NavLink>
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Rule Enabled',
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
      title: 'Updated on',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (updateTime) => {
        return new Date(updateTime).toLocaleString()
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => {
        return (
          <Space size="middle">
            <Button type="text" danger onClick={(e) => handleDelConfirmOpen(record.id)}>
              Delete
            </Button>
          </Space>
        )
      }
    }
  ]

  return (
    <div className="rule-list">
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
