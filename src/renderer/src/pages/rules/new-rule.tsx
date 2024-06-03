import '@renderer/components/add-rule-item/index.less'
import './rules.less'

import {
  App,
  Button,
  Dropdown,
  Flex,
  Form,
  FormListOperation,
  Input,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import {
  DeleteOutlined,
  DownCircleOutlined,
  DownOutlined,
  ExclamationCircleFilled,
  ExperimentOutlined,
  LeftOutlined
} from '@ant-design/icons'
import { RuleItem } from '@renderer/common/contract'
import BodyEditor from '@renderer/components/add-rule-item/body-editor'
import FunctionEditor from '@renderer/components/add-rule-item/function-editor'
import HeaderEditor from '@renderer/components/add-rule-item/header-editor'
import Redirect from '@renderer/components/add-rule-item/redirect'
import ResponseDelay from '@renderer/components/add-rule-item/response-delay'
import ResponseStatus from '@renderer/components/add-rule-item/response-status'
import SpeedLimit from '@renderer/components/add-rule-item/speed-limit'
import MatchTestModal from '@renderer/components/match-test-modal'
import * as Service from '@renderer/services'
import { useRuleStore } from '@renderer/store'
import { ReqMethods } from '@shared/constants'
import { EventResultStatus, IpcResult, Modify, RuleData, RuleType } from '@shared/contract'
import { findGroupOrRule } from '@shared/utils'

const { Text } = Typography

const reqMethods = ReqMethods.map((item) => ({
  label: item,
  value: item
}))

const AddRulesMenu: RuleMenuItem[] = [
  { key: RuleType.Redirect, label: 'ReDirect' },
  { key: RuleType.SpeedLimit, label: 'Add Speed Limit' },
  { key: RuleType.RequestHeader, label: 'Modify Request Headers' },
  { key: RuleType.RequestBody, label: 'Modify Request Body' },
  { key: RuleType.RequestFunction, label: 'Add Request Function' },
  { key: RuleType.ResponseHeader, label: 'Modify Response Headers' },
  { key: RuleType.ResponseBody, label: 'Modify Response Body' },
  { key: RuleType.ResponseDelay, label: 'Add Response Delay' },
  // { key: Rules.ResponseFile, label: 'Replace Response With File' },
  { key: RuleType.ResponseFunction, label: 'Add Response Function' },
  { key: RuleType.ResponseStatus, label: 'Modify Response Status' }
]

type RuleMenuItem = {
  key: RuleType
  label: string
}

function NewRulePage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId')
  const { message, modal } = App.useApp()
  const [form] = Form.useForm()

  const apiRules = useRuleStore((state) => state.apiRules)
  const curRuleGroup = apiRules.find((rule) => rule.id === groupId)

  const { id: editRuleId } = useParams()
  const editRule = useRuleStore((state) => findGroupOrRule(state.apiRules, editRuleId)) as RuleData
  const formInitValues = editRule || {
    name: '',
    description: '',
    enable: true,
    matches: {
      value: '',
      matchType: 'url',
      matchMode: 'contains',
      methods: []
    },
    modifyList: []
  }

  useEffect(() => {
    if (editRule) {
      form.setFieldsValue(editRule)
    }
  }, [editRule])

  const [showReqMethodsFilter, setShowReqMethodsFilter] = useState(false)
  const [showMatchTestModal, setShowMatchTestModal] = useState(false)

  const showAddRuleResult = (result: IpcResult) => {
    if (result.status === EventResultStatus.Success) {
      message.success(`Rule ${editRuleId ? 'edited' : 'added'} successfully`, () => {
        Service.getApiRules()
        navigate('/rules/list')
      })
    } else {
      message.error(`Error: ${result.error}`)
    }
  }

  const handleAddRuleClick = (key: RuleType, add: FormListOperation['add']) => {
    const initValue: RuleItem = { type: key, value: '' }
    if (key === RuleType.ResponseStatus) {
      initValue.value = 200
    }
    if (key === RuleType.RequestHeader || key === RuleType.ResponseHeader) {
      initValue.value = [{ type: 'add', name: '', value: '' }]
    }
    add(initValue)
  }

  const getAddRuleValueComponent = (modify: Modify, index: number) => {
    const field = { name: index, key: index }
    switch (modify.type) {
      case RuleType.Redirect:
        return <Redirect form={form} field={field} />
      case RuleType.SpeedLimit:
        return <SpeedLimit form={form} field={field} />
      case RuleType.RequestHeader:
        return <HeaderEditor form={form} field={field} type="request" />
      case RuleType.ResponseHeader:
        return <HeaderEditor form={form} field={field} type="response" />
      case RuleType.RequestBody:
        return <BodyEditor form={form} field={field} type="request" />
      case RuleType.ResponseBody:
        return <BodyEditor form={form} field={field} type="response" />
      case RuleType.ResponseDelay:
        return <ResponseDelay form={form} field={field} />
      case RuleType.RequestFunction:
        return <FunctionEditor form={form} field={field} type="request" />
      case RuleType.ResponseFunction:
        return <FunctionEditor form={form} field={field} type="response" />
      case RuleType.ResponseStatus:
        return <ResponseStatus form={form} field={field} />
      default:
        return <h2>{modify.type} not accomplished yet!</h2>
    }
  }

  const handleAddRuleSubmit = async (values: RuleData) => {
    if (editRuleId) {
      if (!editRule) {
        showAddRuleResult({
          status: EventResultStatus.Error,
          error: 'Rule not found'
        })
        return
      }
      const result = await window.api.updateRule(
        editRuleId,
        JSON.stringify({
          kind: 'rule',
          name: values.name,
          describe: values.description,
          enable: values.enable,
          matches: values.matches,
          modifyList: values.modifyList
        })
      )
      showAddRuleResult(result)
    } else {
      const result = await window.api.addRule(
        JSON.stringify({
          kind: 'rule',
          name: values.name,
          describe: values.description,
          enable: values.enable,
          matches: values.matches,
          modifyList: values.modifyList
        }),
        { groupId: groupId as string }
      )
      showAddRuleResult(result)
    }
  }

  const handleDelConfirmOpen = (id: string) => {
    const curRule = findGroupOrRule(apiRules, id)
    modal.confirm({
      title: `Are you sure delete "${curRule?.name}"?`,
      icon: <ExclamationCircleFilled />,
      content: 'Your will not be able to recover this rule!',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        const result = await window.api.deleteRule(id)
        if (result.status === EventResultStatus.Success) {
          Service.getApiRules()
          navigate('/rules/list')
        }
      }
    })
  }

  return (
    <div className="page-new">
      <Form
        form={form}
        initialValues={formInitValues}
        style={{ padding: '4px 36px', overflowY: 'auto' }}
        layout="vertical"
        onFinish={handleAddRuleSubmit}
      >
        <div className="page-new-header">
          <Flex align="center">
            <Tooltip title="Go back to rule list">
              <Button className="normal-link" onClick={() => navigate('/rules/list')} type="link">
                <LeftOutlined />
              </Button>
            </Tooltip>
            {editRuleId ? (
              <Text>Edit Rule / {editRule?.name}</Text>
            ) : (
              <Text>{groupId ? curRuleGroup?.name + ' / ' : ''}Create New Rule</Text>
            )}
          </Flex>
          <Space>
            <Form.Item name="enable" noStyle>
              <Switch
                style={{ marginRight: '10px' }}
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              ></Switch>
            </Form.Item>
            <Button type="primary" onClick={() => form.submit()}>
              Save
            </Button>
            {editRuleId && (
              <Button danger onClick={() => handleDelConfirmOpen(editRuleId)}>
                Delete
              </Button>
            )}
          </Space>
        </div>
        <div className="paper-block e2">
          <div className="paper-title">Rule Info: </div>
          <Form.Item name="name" rules={[{ required: true, message: 'Rule name is required' }]}>
            <Input placeholder="Add Rule Name" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder="Add Rule Description (Optional)" />
          </Form.Item>
        </div>

        <div className="paper-block e2">
          <div className="paper-title">Match Rules: </div>
          <Flex gap={4} style={{ paddingBottom: '4px' }} align="baseline">
            <Form.Item name={['matches', 'matchType']} noStyle>
              <Select
                options={[
                  { label: 'URL', value: 'url' },
                  { label: 'Host', value: 'host' },
                  { label: 'Path', value: 'path' }
                ]}
              />
            </Form.Item>
            <Form.Item name={['matches', 'matchMode']} noStyle>
              <Select
                options={[
                  { label: 'Contains', value: 'contains' },
                  { label: 'Equals', value: 'equals' },
                  { label: 'Matches(Regex)', value: 'matches' }
                ]}
              />
            </Form.Item>
            <Form.Item
              name={['matches', 'value']}
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Match value is required' }]}
              noStyle
            >
              <Input placeholder="Match Value" />
            </Form.Item>
            <Flex style={{ position: 'relative', top: 4 }}>
              <Tooltip title="Test macth rules">
                <ExperimentOutlined
                  style={{ fontSize: '16px', marginLeft: '8px' }}
                  onClick={() => setShowMatchTestModal(true)}
                />
              </Tooltip>
              <Tooltip title="Request methods filter">
                <DownCircleOutlined
                  onClick={() => setShowReqMethodsFilter(!showReqMethodsFilter)}
                  style={{
                    fontSize: '16px',
                    marginLeft: '8px',
                    rotate: showReqMethodsFilter ? '180deg' : 'none'
                  }}
                />
              </Tooltip>
            </Flex>
          </Flex>
          <Form.Item
            noStyle
            name={['matches', 'methods']}
            style={{ display: showReqMethodsFilter ? 'block' : 'none' }}
          >
            <Select
              allowClear
              mode="multiple"
              placeholder="Select methods (leave empty to match all)"
              style={{ width: '100%', marginTop: '8px' }}
              options={reqMethods}
            />
          </Form.Item>
        </div>
        <MatchTestModal
          open={showMatchTestModal}
          initValue={{
            matchType: form.getFieldValue(['matches', 'matchType']),
            matchOperator: form.getFieldValue(['matches', 'matchMode']),
            matchValue: form.getFieldValue(['matches', 'value'])
          }}
          onCancel={() => setShowMatchTestModal(false)}
        />

        <Form.List name="modifyList">
          {(fields, { add, remove }) => (
            <>
              <Dropdown
                menu={{
                  items: AddRulesMenu,
                  onClick: (item) => handleAddRuleClick(item.key as RuleType, add)
                }}
              >
                <Button type="primary" style={{ margin: '8px 0' }}>
                  <Space>
                    Add Rules
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
              {form.getFieldValue('modifyList').map((rule, index) => (
                <div key={index} style={{ position: 'relative' }} className="paper-block e2">
                  <Tooltip title="remove rule" placement="top" arrow>
                    <DeleteOutlined
                      style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 999 }}
                      onClick={() => remove(index)}
                    />
                  </Tooltip>

                  {getAddRuleValueComponent(rule, index)}
                </div>
              ))}
            </>
          )}
        </Form.List>
      </Form>
    </div>
  )
}

export default NewRulePage
