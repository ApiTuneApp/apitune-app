import { App, Button, Space, Table, TableProps } from 'antd'
import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import RuleViewModal from '@renderer/components/rule-view-modal'
import * as Service from '@renderer/services'
import { strings } from '@renderer/services/localization'
import {
  ApiRuleItem,
  EventResultStatus,
  RenderEvent,
  RuleData,
  RuleGroup,
  ShareRule
} from '@shared/contract'

export default function ShareViewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const shareData = location?.state?.shareData as ShareRule
  const [ruleViewModalOpen, setRuleViewModalOpen] = useState(false)
  const [ruleViewModalRuleData, setRuleViewModalRuleData] = useState<RuleData>()

  function handleOpenRuleViewModal(ruleData: RuleData) {
    setRuleViewModalRuleData(ruleData)
    setRuleViewModalOpen(true)
  }

  function handleDupeToMyRules() {
    if (shareData?.rule_data) {
      window.api.duplicateRules(JSON.stringify(shareData)).then((res) => {
        if (res.status === EventResultStatus.Success) {
          Service.getApiRules(RenderEvent.DuplicateRules)
          message.success(strings.duplicateSuccess)
          if (shareData?.rule_data.kind === 'group') {
            navigate('/rules/list')
          } else {
            navigate(`/rules/edit/${res.data.id}`)
          }
        }
      })
    }
  }

  const groupColumns: TableProps<ApiRuleItem>['columns'] = [
    {
      title: shareData?.rule_data.kind === 'group' ? strings.ruleGroupName : strings.ruleName,
      dataIndex: 'name',
      key: 'name',
      render: (_, r) => {
        if (r.kind === 'group') {
          return r.name
        }
        return (
          <Button type="link" style={{ padding: 0 }} onClick={() => handleOpenRuleViewModal(r)}>
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

  const ruleColumns: TableProps<RuleData>['columns'] = [
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

  return (
    <div className="page-rule-list">
      {type === 'view' && (
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={handleDupeToMyRules}>
            {strings.duplicateToMyRules}
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
