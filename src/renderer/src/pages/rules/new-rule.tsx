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
  MenuProps,
  Select,
  Space,
  Switch,
  Tabs,
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
import Rewrite from '@renderer/components/add-rule-item/rewrite'
import ResponseDelay from '@renderer/components/add-rule-item/response-delay'
import ResponseStatus from '@renderer/components/add-rule-item/response-status'
import SpeedLimit from '@renderer/components/add-rule-item/speed-limit'
import MatchTestModal from '@renderer/components/match-test-modal'
import * as Service from '@renderer/services'
import { useRuleStore } from '@renderer/store'
import { ReqMethods } from '@shared/constants'
import { EventResultStatus, IpcResult, Modify, RuleData, RuleType } from '@shared/contract'
import { findGroupOrRule } from '@shared/utils'
import MonacoEditor from '@renderer/components/monaco-editor'

const { Text } = Typography

const reqMethods = ReqMethods.map((item) => ({
  label: item,
  value: item
}))

const DefaultAddRulesMenu: MenuProps['items'] = [
  {
    key: 'request',
    type: 'group',
    label: 'Request Modify',
    children: [
      {
        key: RuleType.Rewrite,
        label: 'Rewrite Request',
        disabled: false
      },
      {
        key: RuleType.RequestHeader,
        label: 'Modify Request Headers',
        disabled: false
      },
      {
        key: RuleType.RequestBody,
        label: 'Modify Request Body',
        disabled: false
      },
      {
        key: RuleType.RequestFunction,
        label: 'Add Request Function',
        disabled: false
      },
      {
        key: RuleType.RequestSpeedLimit,
        disabled: false,
        label: 'Add Request Speed Limit'
      }
    ]
  },
  {
    key: 'response',
    type: 'group',
    label: 'Response Modify',
    children: [
      {
        key: RuleType.ResponseStatus,
        disabled: false,
        label: 'Modify Response Status'
      },
      {
        key: RuleType.ResponseHeader,
        disabled: false,
        label: 'Modify Response Headers'
      },
      {
        key: RuleType.ResponseBody,
        disabled: false,
        label: 'Modify Response Body'
      },
      {
        key: RuleType.ResponseFunction,
        disabled: false,
        label: 'Add Response Function'
      },
      {
        key: RuleType.ResponseDelay,
        disabled: false,
        label: 'Add Response Delay'
      }
    ]
  }
]

interface MenuChildItem {
  key: RuleType
  label: string
  disabled: boolean
}

interface RuleMenuItem {
  key: string
  label: string
  type: 'group' | null
  children?: Array<MenuChildItem>
}

function NewRulePage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId')
  const targetTab = searchParams.get('tab') || 'rule'
  const { message, modal } = App.useApp()
  const [form] = Form.useForm()

  const apiRules = useRuleStore((state) => state.apiRules)
  const curRuleGroup = apiRules.find((rule) => rule.id === groupId)
  const [addRulesMenu, setAddRulesMenu] = useState<MenuProps['items']>(DefaultAddRulesMenu)

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
      setShowReqMethodsFilter(!!editRule.matches.methods.length)
      setAddRulesMenu((prev) => {
        // Disable already added rule menu
        const newMenu = prev!.map((item) => {
          const menItem = item as RuleMenuItem
          if (menItem.type === 'group' && menItem.children) {
            menItem.children = menItem.children.map((child) => {
              if (editRule.modifyList.some((modify) => modify.type === child.key)) {
                return { ...child, disabled: true }
              }
              return { ...child, disabled: false }
            })
          }
          return menItem
        })
        return newMenu
      })
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

    if (key === RuleType.RequestFunction) {
      initValue.value = `/**
 * You can modify request body here,
 * the context variables you can use:
 *  * {
 *  _ctx: Context, // Koa context
    request: { // Request infor
        url: {
            host: '',
            href: '',
            protocol: '',
            pathname: ''
        },
        ip: '',
        headers: {}, //Request headers
    },
    params: {}, // Request parameters, you can get GET or POST params here
    requestBody: {}, // Request body
    requestHeaders：: {}, // Request headers
   }

   Code examples:
   1. Change request headers:
    requestHeaders.xxx = 'xxx'
   3. Change request body:
    if(requestBody.type == 1) {
      requestBody.aaa = 1
    }
 */`
    }

    if (key === RuleType.ResponseFunction) {
      initValue.value = `/**
 * You can modify response value here,
 * the context variables you can use:
 *  * {
 *  _ctx: Context, // Koa context
    request: { // Request infor
        url: {
            host: '',
            href: '',
            protocol: '',
            pathname: ''
        },
        ip: '',
        headers: {}, //Request headers
    },
    params: {}, // Request parameters, you can get GET or POST params here
    responseBody: {}, // Response data
    responseHeaders: {}, // Response headers
    responseStatus: 200, // Response status
   }

   Code examples:
   1. Change response data:
    responseBody = { aaa: 123 }
   2. Change response headers:
    responseHeaders.xxx = 'xxx'
   3. Change response data by request params:
    if(params.type == 1) {
     responseBody = {bbb: 111}
    }
 */`
    }
    add(initValue)
    // disable same type rule menu
    setAddRulesMenu((prev) => {
      const newMenu = prev!.map((item) => {
        const menItem = item as RuleMenuItem
        if (menItem.type === 'group' && menItem.children) {
          menItem.children = menItem.children.map((child) => {
            if (child.key === key) {
              return { ...child, disabled: true }
            }
            return child
          })
        }
        return item
      })
      return newMenu
    })
  }

  const getAddRuleValueComponent = (modify: Modify, index: number) => {
    const field = { name: index, key: index }
    switch (modify.type) {
      case RuleType.Rewrite:
        return <Rewrite form={form} field={field} />
      case RuleType.RequestSpeedLimit:
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
          modifyList: values.modifyList,
          testScript: values.testScript
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
          modifyList: values.modifyList,
          testScript: values.testScript
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
        style={{ padding: '4px 16px', overflowY: 'auto' }}
        layout="vertical"
        onFinish={handleAddRuleSubmit}
      >
        <div className="page-new-header">
          <Flex align="center">
            <Tooltip title="Go back" overlayClassName="j-autohide-tooltip">
              <Button className="normal-link" onClick={() => navigate(-1)} type="link">
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
          <Form.Item noStyle name={['matches', 'methods']}>
            <Select
              allowClear
              mode="multiple"
              placeholder="Select methods (leave empty to match all)"
              style={{
                width: '100%',
                marginTop: '8px',
                display: showReqMethodsFilter ? 'block' : 'none'
              }}
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
        <Tabs
          defaultActiveKey={targetTab}
          items={[
            {
              key: 'rules',
              label: 'Rules',
              children: (
                <Form.List name="modifyList">
                  {(fields, { add, remove }) => (
                    <>
                      <Dropdown
                        trigger={['click']}
                        menu={{
                          items: addRulesMenu,
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
                        <div
                          key={index}
                          style={{ position: 'relative' }}
                          className="paper-block e2"
                        >
                          <Tooltip title="remove rule" placement="top" arrow>
                            <DeleteOutlined
                              style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                zIndex: 999
                              }}
                              onClick={() => remove(index)}
                            />
                          </Tooltip>

                          {getAddRuleValueComponent(rule, index)}
                        </div>
                      ))}
                    </>
                  )}
                </Form.List>
              )
            },
            {
              key: 'tests',
              label: 'Test&Script',
              children: (
                <Flex justify="space-between" style={{ width: '100%' }}>
                  <Form.Item name="testScript" style={{ flex: 1 }}>
                    <MonacoEditor defaultLanguage="javascript" height={400} />
                  </Form.Item>
                  <div style={{ width: 440, padding: '0 10px' }}>
                    <div style={{ fontWeight: 'bold' }}>Snippets</div>
                    <Button type="text">Response status code is 200</Button>
                    <Button type="text">Response includes expected headers</Button>
                    <Button type="text">Response status code is 200</Button>
                  </div>
                </Flex>
              )
            }
          ]}
        />
      </Form>
    </div>
  )
}

export default NewRulePage
