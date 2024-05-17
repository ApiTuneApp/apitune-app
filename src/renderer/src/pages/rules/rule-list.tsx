import * as React from 'react'

import * as RuleService from '@renderer/services/rule'
import { useRuleStore } from '@renderer/store'
import { ApiRuleItem, EventResultStatus, RuleData, RuleGroup } from '@shared/contract'
import GroupEditModal from '@renderer/components/group-edit-modal'

import { Switch, Space, Table, Button, App } from 'antd'
import type { TableProps } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { NavLink } from 'react-router-dom'

interface RowProps {
  rule: ApiRuleItem
  triggerRuleEnable: (rule: ApiRuleItem, enable: boolean) => void
}

function Row({ rule, triggerRuleEnable }: RowProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <React.Fragment>
      {/* <TableRow>
        <TableCell>
          {rule.kind === 'group' && rule.ruleList.length > 0 ? (
            <IconButton aria-label="expand rule" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          ) : null}
        </TableCell>
        <TableCell>{rule.name}</TableCell>
        <TableCell>
          <Switch
            checked={rule.enable}
            size="small"
            onChange={(e) => triggerRuleEnable(rule, e.target.checked)}
          />
        </TableCell>
        <TableCell>Jan 04, 2024</TableCell>
        <TableCell align="center">
          <Button>Rename</Button>
          <Button>Edit</Button>
          <Button color="error">Delete</Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rule Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Rule Enable</TableCell>
                    <TableCell>Updated on</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rule as RuleGroup).ruleList.map((r: RuleData) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <NavLink to={`/rules/edit/${r.id}`}>{r.name}</NavLink>
                      </TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell>
                        <Switch
                          checked={r.enable}
                          size="small"
                          onChange={(e) => triggerRuleEnable(rule, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>Jan 04, 2024</TableCell>
                      <TableCell align="center">
                        <Button size="small">Edit</Button>
                        <Button color="error" size="small">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow> */}
    </React.Fragment>
  )
}

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
    <div className="rule-list" style={{ padding: '8px 24px', height: '100%', width: '100%' }}>
      <Table
        dataSource={apiRules}
        columns={groupColumns}
        expandable={{
          expandedRowRender: (record) => {
            return <Table dataSource={(record as RuleGroup).ruleList} columns={ruleColumns}></Table>
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
