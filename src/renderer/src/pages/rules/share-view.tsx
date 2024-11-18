import { Button, Space, Switch, Table, TableProps, Tooltip } from 'antd'
import { NavLink, useLocation, useSearchParams } from 'react-router-dom'

import { strings } from '@renderer/services/localization'
import { ApiRuleItem, RuleData, RuleGroup, ShareRule } from '@shared/contract'
import { findParentGroup } from '@shared/utils'
import { useState } from 'react'
import RuleViewModal from '@renderer/components/rule-view-modal'

export default function ShareViewPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const shareData = location?.state?.shareData as ShareRule
  const [ruleViewModalOpen, setRuleViewModalOpen] = useState(false)
  const [ruleViewModalRuleData, setRuleViewModalRuleData] = useState<RuleData>()

  function triggerRuleEnable(rule, enabled) {
    console.log(rule, enabled)
  }

  function handleOpenRuleViewModal(ruleData: RuleData) {
    setRuleViewModalRuleData(ruleData)
    setRuleViewModalOpen(true)
  }

  function handleDuplicateToMyRules() {
    console.log('duplicate to my rules')
  }

  function handleImportToMyShare() {
    console.log('import to my share')
  }

  const groupColumns: TableProps<ApiRuleItem>['columns'] =
    type === 'view'
      ? [
          {
            title: shareData?.rule_data.kind === 'group' ? strings.ruleGroupName : strings.ruleName,
            dataIndex: 'name',
            key: 'name',
            render: (_, r) => {
              if (r.kind === 'group') {
                return r.name
              }
              return (
                <Button
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => handleOpenRuleViewModal(r)}
                >
                  {r.name}
                </Button>
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
            title: strings.createBy,
            dataIndex: 'createBy',
            key: 'createBy',
            render: () => {
              return shareData?.users?.full_name
            }
          }
        ]
      : [
          {
            title: strings.ruleGroupName,
            dataIndex: 'name',
            key: 'name'
          },
          {
            title: strings.groupEnabled,
            dataIndex: 'enable',
            key: 'enable',
            render: (enable, rule) => {
              return (
                <Switch
                  checked={false}
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
          }
        ]

  const ruleColumns: TableProps<RuleData>['columns'] =
    type === 'view'
      ? [
          {
            title: strings.ruleName,
            dataIndex: 'name',
            key: 'name',
            width: '40%',
            render: (_, r) => {
              return (
                <Button type="link" onClick={() => handleOpenRuleViewModal(r)}>
                  {r.name}
                </Button>
              )
            }
          },
          {
            title: strings.description,
            dataIndex: 'description',
            key: 'description'
          }
        ]
      : [
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
              const ruleGroup = findParentGroup([shareData?.rule_data], rule.id)
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
          }
        ]

  return (
    <div className="page-rule-list">
      {type === 'view' && (
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleDuplicateToMyRules}>{strings.duplicateToMyRules}</Button>
          <Button type="primary" onClick={handleImportToMyShare}>
            {strings.importToMyShare}
          </Button>
        </Space>
      )}
      {shareData && (
        <>
          <Table
            rowKey="id"
            style={{ marginTop: 10 }}
            dataSource={[shareData?.rule_data]}
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
          <RuleViewModal
            ruleData={ruleViewModalRuleData as RuleData}
            open={ruleViewModalOpen}
            onClose={() => setRuleViewModalOpen(false)}
          />
        </>
      )}
    </div>
  )
}
