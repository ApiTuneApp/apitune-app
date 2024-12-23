import '@renderer/components/add-rule-item/index.less'

import {
  App,
  Button,
  Divider,
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
  Typography,
  Collapse
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import {
  DeleteOutlined,
  DownCircleOutlined,
  DownOutlined,
  ExclamationCircleFilled,
  ExperimentOutlined,
  LeftOutlined,
  PlusOutlined
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
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { ReqMethods } from '@shared/constants'
import {
  EventResultStatus,
  IpcResult,
  Modify,
  RenderEvent,
  RuleData,
  RuleType
} from '@shared/contract'
import { findGroupOrRule, findParentGroup } from '@shared/utils'
import MonacoEditor from '@renderer/components/monaco-editor'

import { SnippetType, getSnippet } from '@renderer/common/snippets'
import { useSettingStore } from '@renderer/store/setting'

const { Text } = Typography

const reqMethods = ReqMethods.map((item) => ({
  label: item,
  value: item
}))

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

interface RuleEditorProps {
  groupId?: string | null
  targetTab?: string
  disabled?: boolean
  editRuleId?: string
  ruleData?: RuleData
}

const preStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  overflowX: 'auto',
  background: 'var(--color-background-soft)',
  padding: '8px'
}

function RuleEditor({
  editRuleId,
  groupId,
  targetTab,
  disabled,
  ruleData
}: RuleEditorProps): JSX.Element {
  const navigate = useNavigate()
  const { language } = useSettingStore((state) => state)

  // groupId has value when add new rule to a group
  const { message, modal } = App.useApp()
  const [form] = Form.useForm()

  const apiRules = useRuleStore((state) => state.apiRules)
  const curRuleGroup = apiRules.find((rule) => rule.id === groupId)
  const allRuleGroups = apiRules.filter((rule) => rule.kind === 'group')
  const editRule = ruleData
    ? ruleData
    : (useRuleStore((state) => findGroupOrRule(state.apiRules, editRuleId)) as RuleData)
  const editRuleParentGroup = editRuleId ? findParentGroup(apiRules, editRuleId) : null

  const DefaultAddRulesMenu: MenuProps['items'] = [
    {
      key: 'request',
      type: 'group',
      label: strings.requestModify + ':',
      children: [
        {
          key: RuleType.Rewrite,
          label: strings.rewriteRequest,
          disabled: false
        },
        {
          key: RuleType.RequestHeader,
          label: strings.modifyReqHeaders,
          disabled: false
        },
        {
          key: RuleType.RequestBody,
          label: strings.modifyReqBody,
          disabled: false
        },
        {
          key: RuleType.RequestFunction,
          label: strings.addReqFunction,
          disabled: false
        },
        {
          key: RuleType.RequestSpeedLimit,
          disabled: false,
          label: strings.addReqSpeedLimit
        }
      ]
    },
    {
      key: 'response',
      type: 'group',
      label: strings.responseModify + ':',
      children: [
        {
          key: RuleType.ResponseStatus,
          disabled: false,
          label: strings.modifyResStatus
        },
        {
          key: RuleType.ResponseHeader,
          disabled: false,
          label: strings.modifyResHeaders
        },
        {
          key: RuleType.ResponseBody,
          disabled: false,
          label: strings.modifyResBody
        },
        {
          key: RuleType.ResponseFunction,
          disabled: false,
          label: strings.addResFunction
        },
        {
          key: RuleType.ResponseDelay,
          disabled: false,
          label: strings.addResDelay
        }
      ]
    }
  ]

  const [addRulesMenu, setAddRulesMenu] = useState<MenuProps['items']>(DefaultAddRulesMenu)
  const allRuleGroupsMenu: MenuProps['items'] =
    editRuleId && editRuleParentGroup
      ? [
          ...allRuleGroups.map((group) => ({
            key: group.id,
            label: group.name
          })),
          {
            type: 'divider'
          },
          {
            key: 'removeFromGroup',
            label: strings.removeFromGroup,
            danger: true
          }
        ]
      : allRuleGroups.map((group) => ({
          key: group.id,
          label: group.name
        }))

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
    setAddRulesMenu(DefaultAddRulesMenu)
  }, [language])

  useEffect(() => {
    if (editRule) {
      form.setFieldsValue(editRule)
      setShowReqMethodsFilter(!!editRule.matches.methods.length)
      setMenuDisabled()
    }
  }, [editRule])

  const [showReqMethodsFilter, setShowReqMethodsFilter] = useState(false)
  const [showMatchTestModal, setShowMatchTestModal] = useState(false)

  const showAddRuleResult = (result: IpcResult) => {
    if (result.status === EventResultStatus.Success) {
      message.success(editRuleId ? strings.ruleEdited : strings.ruleAdded, () => {
        Service.getApiRules(editRuleId ? RenderEvent.UpdateRule : RenderEvent.AddRule)
        // navigate('/rules/list')
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
 * ${strings.formatString(strings.youCanModify, strings.requestBody.toLowerCase())},
 * ${strings.contextVarYouCanUse}:
 *  * {
 *  _ctx: Context, // ${strings.koaContext}
    request: { // ${strings.requestInfo}
        url: {
            host: '',
            href: '',
            protocol: '',
            pathname: ''
        },
        ip: '',
        headers: {}, // ${strings.requestHeaders}
    },
    params: {}, // ${strings.reqParamsDesc}
    requestBody: {}, // ${strings.requestBody}
    requestHeaders：: {}, // ${strings.requestHeaders}
   }

   ${strings.codeExamples}:
   1. ${strings.formatString(strings.changeTarget, strings.requestHeaders.toLowerCase())}:
    requestHeaders.xxx = 'xxx'
   2. ${strings.formatString(strings.changeTarget, strings.requestBody.toLowerCase())}:
    if(requestBody.type == 1) {
      requestBody.aaa = 1
    }
 */`
    }

    if (key === RuleType.ResponseFunction) {
      initValue.value = `/**
 * ${strings.formatString(strings.youCanModify, strings.responseBody.toLowerCase())},
 * ${strings.contextVarYouCanUse}:
 *  * {
 *  _ctx: Context, // ${strings.koaContext}
    request: { // ${strings.requestInfo}
        url: {
            host: '',
            href: '',
            protocol: '',
            pathname: ''
        },
        ip: '',
        headers: {}, // ${strings.requestHeaders}
    },
    params: {}, // ${strings.reqParamsDesc}
    responseBody: {}, // ${strings.responseBody}
    responseHeaders: {}, // ${strings.responseHeaders}
    responseStatus: 200, // ${strings.statusCode}
   }

   ${strings.codeExamples}:
   1. ${strings.formatString(strings.changeTarget, strings.responseBody.toLowerCase())}:
    responseBody = { aaa: 123 }
   2. ${strings.formatString(strings.changeTarget, strings.responseHeaders.toLowerCase())}:
    responseHeaders.xxx = 'xxx'
   3. ${strings.changeByReqParams}:
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

  function setMenuDisabled() {
    setAddRulesMenu((prev) => {
      // Disable already added rule menu
      const newMenu = prev!.map((item) => {
        const menItem = item as RuleMenuItem
        if (menItem.type === 'group' && menItem.children) {
          menItem.children = menItem.children.map((child) => {
            const curModifyList = form.getFieldValue('modifyList')
            if (curModifyList.some((modify) => modify.type === child.key)) {
              return { ...child, disabled: true }
            }
            return { ...child, disabled: false }
          })
        }
        return menItem
      })
      return newMenu as MenuProps['items']
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
          error: strings.ruleNotFound
        })
        return
      }
      const result = await window.api.updateRule(
        editRuleId,
        JSON.stringify({
          kind: 'rule',
          name: values.name,
          description: values.description,
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
          description: values.description,
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
      title: strings.formatString(strings.deleteTitle, curRule!.name),
      icon: <ExclamationCircleFilled />,
      content: strings.formatString(strings.deleteDesc, strings.rule),
      okText: strings.yes,
      okType: 'danger',
      cancelText: strings.no,
      onOk: async () => {
        const result = await window.api.deleteRule(id)
        if (result.status === EventResultStatus.Success) {
          Service.getApiRules(RenderEvent.DeleteRule)
          navigate('/rules/list')
        } else {
          message.error(result.error)
        }
      }
    })
  }

  const insertSnippet = (type: SnippetType) => {
    const currentValue = form.getFieldValue('testScript')
      ? form.getFieldValue('testScript') + '\n\n'
      : ''
    form.setFieldsValue({
      testScript: currentValue + getSnippet(type)
    })
  }

  const handleEditGroupClick = async (key: string) => {
    if (editRuleId) {
      const result = await window.api.editRuleGroup(
        editRuleId,
        key === 'removeFromGroup' ? undefined : key
      )
      showAddRuleResult(result)
    }
  }

  return (
    <Form
      form={form}
      disabled={disabled}
      initialValues={formInitValues}
      style={{ padding: '4px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      layout="vertical"
      onFinish={handleAddRuleSubmit}
    >
      {!disabled && (
        <div className="page-new-header">
          <Flex align="center">
            <Tooltip title="Go back" overlayClassName="j-autohide-tooltip">
              <Button className="normal-link" onClick={() => navigate(-1)} type="link">
                <LeftOutlined />
              </Button>
            </Tooltip>
            {editRuleId ? (
              <Text>
                {strings.editRule} / {editRule?.name}
              </Text>
            ) : (
              <Text>
                {groupId ? curRuleGroup?.name + ' / ' : ''}
                {strings.createNewRule}
              </Text>
            )}
          </Flex>
          <Space>
            <Form.Item name="enable" noStyle>
              <Switch
                checkedChildren={strings.enabled}
                unCheckedChildren={strings.enabled}
              ></Switch>
            </Form.Item>
            <Divider type="vertical" style={{ borderColor: 'var(--color-text-3)' }} />
            {!groupId && (
              // we don't need show this when add new rule to a group
              <Dropdown
                menu={{
                  items: allRuleGroupsMenu,
                  selectable: true,
                  defaultSelectedKeys: [editRuleParentGroup?.id || ''],
                  onClick: ({ key }) => handleEditGroupClick(key)
                }}
                trigger={['click']}
              >
                <Button>
                  <Space>
                    {strings.editGroup}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            )}
            <Button type="primary" onClick={() => form.submit()}>
              {strings.save}
            </Button>
            {editRuleId && (
              <Button danger onClick={() => handleDelConfirmOpen(editRuleId)}>
                {strings.delete}
              </Button>
            )}
          </Space>
        </div>
      )}

      <div id="ruleEditorContainer" style={{ overflowY: 'auto' }}>
        <div className="paper-block e2">
          <div className="paper-title">{strings.ruleInfo}: </div>
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: strings.formatString(strings.isRequired, strings.ruleName) as string
              }
            ]}
          >
            <Input placeholder={strings.addRuleName} />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder={strings.addRuleDescription} />
          </Form.Item>
        </div>

        <div className="paper-block e2">
          <div className="paper-title">{strings.matchRules}: </div>
          <Flex gap={4} style={{ paddingBottom: '4px' }} align="baseline">
            <Form.Item name={['matches', 'matchType']} noStyle>
              <Select
                style={{ width: 100 }}
                options={[
                  { label: strings.url, value: 'url' },
                  { label: strings.host, value: 'host' },
                  { label: strings.path, value: 'path' }
                ]}
              />
            </Form.Item>
            <Form.Item name={['matches', 'matchMode']} noStyle>
              <Select
                style={{ width: 180 }}
                options={[
                  { label: strings.contains, value: 'contains' },
                  { label: strings.equals, value: 'equals' },
                  { label: strings.matchesRegex, value: 'matches' }
                ]}
              />
            </Form.Item>
            <Form.Item
              name={['matches', 'value']}
              style={{ flex: 1 }}
              rules={[
                {
                  required: true,
                  message: strings.formatString(strings.isRequired, strings.matchValue) as string
                }
              ]}
              noStyle
            >
              <Input placeholder={strings.matchValue} />
            </Form.Item>
            <Flex style={{ position: 'relative', top: 4 }}>
              <Tooltip title={strings.testMatchValue}>
                <ExperimentOutlined
                  style={{ fontSize: '16px', marginLeft: '8px' }}
                  onClick={() => setShowMatchTestModal(true)}
                />
              </Tooltip>
              <Tooltip title={strings.reqMethodsFilter}>
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
              placeholder={strings.selectMethods}
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
              label: strings.rules,
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
                            {strings.addRules}
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
                          <Tooltip title={strings.removeRule} placement="top" arrow>
                            <DeleteOutlined
                              style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                zIndex: 999
                              }}
                              onClick={() => {
                                remove(index)
                                setMenuDisabled()
                              }}
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
              label: strings.testAndScripts,
              children: (
                <Flex justify="space-between" style={{ width: '100%' }}>
                  <Form.Item name="testScript" style={{ flex: 1 }}>
                    <MonacoEditor defaultLanguage="javascript" height={400} />
                  </Form.Item>
                  <div style={{ minWidth: 240, padding: '0 10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{strings.snippets}</div>
                    <Collapse size="small" bordered={false}>
                      <Collapse.Panel
                        header="Request param is expected"
                        key="requestBody"
                        extra={
                          <Tooltip title={strings.insertSnippet}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                insertSnippet('requestBody')
                              }}
                            />
                          </Tooltip>
                        }
                      >
                        <pre style={preStyle}>{getSnippet('requestBody')}</pre>
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="Request headers is expected"
                        key="requestHeaders"
                        extra={
                          <Tooltip title={strings.insertSnippet}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                insertSnippet('requestHeaders')
                              }}
                            />
                          </Tooltip>
                        }
                      >
                        <pre style={preStyle}>{getSnippet('responseStatus200')}</pre>
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="Response status code is 200"
                        key="responseStatus200"
                        extra={
                          <Tooltip title={strings.insertSnippet}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                insertSnippet('responseStatus200')
                              }}
                            />
                          </Tooltip>
                        }
                      >
                        <pre style={preStyle}>{getSnippet('responseStatus200')}</pre>
                      </Collapse.Panel>

                      <Collapse.Panel
                        header="Response includes expected headers"
                        key="expectedHeaders"
                        extra={
                          <Tooltip title={strings.insertSnippet}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                insertSnippet('expectedHeaders')
                              }}
                            />
                          </Tooltip>
                        }
                      >
                        <pre style={preStyle}>{getSnippet('expectedHeaders')}</pre>
                      </Collapse.Panel>

                      <Collapse.Panel
                        header="Should pass in async script"
                        key="asyncTest"
                        extra={
                          <Tooltip title={strings.insertSnippet}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                insertSnippet('asyncTest')
                              }}
                            />
                          </Tooltip>
                        }
                      >
                        <pre style={preStyle}>{getSnippet('asyncTest')}</pre>
                      </Collapse.Panel>

                      <Collapse.Panel
                        header="Print request body"
                        key="printRequestBody"
                        extra={
                          <Tooltip title={strings.insertSnippet}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                insertSnippet('printRequestBody')
                              }}
                            />
                          </Tooltip>
                        }
                      >
                        <pre style={preStyle}>{getSnippet('printRequestBody')}</pre>
                      </Collapse.Panel>

                      <Collapse.Panel
                        header="Print status with different color"
                        key="printResponseStatus"
                        extra={
                          <Tooltip title={strings.insertSnippet}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                insertSnippet('printResponseStatus')
                              }}
                            />
                          </Tooltip>
                        }
                      >
                        <pre style={preStyle}>{getSnippet('printResponseStatus')}</pre>
                      </Collapse.Panel>

                      <Collapse.Panel
                        header="Print response headers with list"
                        key="printAllResponseHeaders"
                        extra={
                          <Tooltip title={strings.insertSnippet}>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={(e) => {
                                e.stopPropagation()
                                insertSnippet('printAllResponseHeaders')
                              }}
                            />
                          </Tooltip>
                        }
                      >
                        <pre style={preStyle}>{getSnippet('printAllResponseHeaders')}</pre>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                </Flex>
              )
            }
          ]}
        />
      </div>
    </Form>
  )
}

export default RuleEditor
