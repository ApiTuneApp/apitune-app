import '@renderer/components/add-rule-item/index.less'
import './rules.less'

import { App, Button, Dropdown, Flex, Input, Select, Space, Switch, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import {
  DeleteOutlined,
  DownCircleOutlined,
  DownOutlined,
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
import * as RuleService from '@renderer/services/rule'
import { useRuleStore } from '@renderer/store'
import { ReqMethods } from '@shared/constants'
import { EventResultStatus, IpcResult, RuleData, RuleType } from '@shared/contract'
import { findGroupOrRule } from '@shared/utils'

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
  const { message } = App.useApp()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId')

  const apiRules = useRuleStore((state) => state.apiRules)
  const curRuleGroup = apiRules.find((rule) => rule.id === groupId)

  const { id: editRuleId } = useParams()
  const editRule = useRuleStore((state) => findGroupOrRule(state.apiRules, editRuleId)) as RuleData

  // init rule data when editRuleId changes:
  useEffect(() => {
    if (editRule) {
      setRuleName(editRule.name)
      setRuleDesc(editRule.description)
      setRuleEnable(editRule.enable)
      setMatchType(editRule.matches.matchType)
      setMatchValue(editRule.matches.value)
      setMatchMode(editRule.matches.matchMode)
      setMatchMethods(editRule.matches.methods)
      setChangeList(
        editRule.modifyList.map((rule) => ({
          type: rule.type,
          value: rule.value,
          valid: true
        }))
      )
    }
  }, [editRuleId])

  const [ruleName, setRuleName] = useState('')
  const [ruleDesc, setRuleDesc] = useState('')
  const [ruleEnable, setRuleEnable] = useState(true)
  const [matchType, setMatchType] = useState('url')
  const [matchValue, setMatchValue] = useState('')
  const [matchMode, setMatchMode] = useState('contains')
  const [matchMethods, setMatchMethods] = useState<string[]>([])

  const [showReqMethodsFilter, setShowReqMethodsFilter] = useState(false)
  const [modifyList, setChangeList] = useState<RuleItem[]>([])

  const showAddRuleResult = (result: IpcResult) => {
    if (result.status === EventResultStatus.Success) {
      message.success(`Rule ${editRuleId ? 'edited' : 'added'} successfully`, () => {
        RuleService.getApiRules()
        navigate('/rules/list')
      })
    } else {
      message.error(`Error: ${result.error}`)
    }
  }

  const handleAddRuleClick = (key: RuleType) => {
    const initValue: RuleItem = { type: key, value: '', valid: false }
    if (key === RuleType.ResponseStatus) {
      initValue.value = 200
    }
    setChangeList((prevRules) => [...prevRules, initValue])
  }

  // there should only one type in rule list
  const getSetValueMethod = (rule: RuleItem) => {
    return (value: RuleItem['value']) =>
      setChangeList((prevRules) =>
        prevRules.map((r) => {
          if (r.type === rule.type) {
            return { ...r, value }
          }
          return r
        })
      )
  }

  const getSetValidMethod = (rule: RuleItem) => {
    return (valid: RuleItem['valid']) => {
      return setChangeList((prevRules) =>
        prevRules.map((r) => {
          if (r.type === rule.type) {
            return { ...r, valid }
          }
          return r
        })
      )
    }
  }

  const getAddRuleValueComponent = (rule: RuleItem) => {
    const type = rule.type
    const setValue = getSetValueMethod(rule)
    const setValid = getSetValidMethod(rule)
    switch (type) {
      case RuleType.Redirect:
        return <Redirect rule={rule} setValue={setValue} setValid={setValid} />
      case RuleType.SpeedLimit:
        return <SpeedLimit rule={rule} setValue={setValue} setValid={setValid} />
      case RuleType.RequestHeader:
        return <HeaderEditor rule={rule} setValue={setValue} setValid={setValid} type="request" />
      case RuleType.ResponseHeader:
        return <HeaderEditor rule={rule} setValue={setValue} setValid={setValid} type="response" />
      case RuleType.RequestBody:
        return <BodyEditor rule={rule} setValue={setValue} setValid={setValid} type="request" />
      case RuleType.ResponseBody:
        return <BodyEditor rule={rule} setValue={setValue} setValid={setValid} type="response" />
      case RuleType.ResponseDelay:
        return <ResponseDelay rule={rule} setValue={setValue} setValid={setValid} />
      case RuleType.RequestFunction:
        return <FunctionEditor rule={rule} setValue={setValue} setValid={setValid} type="request" />
      case RuleType.ResponseFunction:
        return (
          <FunctionEditor rule={rule} setValue={setValue} setValid={setValid} type="response" />
        )
      case RuleType.ResponseStatus:
        return <ResponseStatus rule={rule} setValue={setValue} setValid={setValid} />
      default:
        return <h2>{type} not accomplished yet!</h2>
    }
  }

  const handleAddRuleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    modifyList.forEach((rule) => {
      if (rule.validator) {
        rule.validator(rule.value)
      }
    })
    const formValid = modifyList.every((rule) => rule.valid)
    if (!ruleName) {
      showAddRuleResult({
        status: EventResultStatus.Error,
        error: 'Rule name is required'
      })
      return
    }
    if (formValid) {
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
            name: ruleName,
            describe: ruleDesc,
            enable: ruleEnable,
            matches: {
              value: matchValue,
              matchType,
              matchMode,
              methods: matchMethods
            },
            modifyList: modifyList.map((rule) => ({
              type: rule.type,
              value: rule.value
            }))
          })
        )
        showAddRuleResult(result)
      } else {
        const result = await window.api.addRule(
          JSON.stringify({
            kind: 'rule',
            name: ruleName,
            describe: ruleDesc,
            enable: ruleEnable,
            matches: {
              value: matchValue,
              matchType,
              matchMode,
              methods: matchMethods
            },
            modifyList: modifyList.map((rule) => ({
              type: rule.type,
              value: rule.value
            }))
          }),
          { groupId: groupId as string }
        )
        showAddRuleResult(result)
      }
    }
  }

  const removeRule = (index: number) => {
    const newRules = modifyList.filter((_, i) => i !== index)
    setChangeList(newRules)
  }

  return (
    <div className="page-new">
      <div className="page-new-header">
        <Flex align="center">
          <Tooltip title="Go back to rule list">
            <Button
              className="normal-link"
              onClick={() => navigate('/rules/list')}
              type="link"
              size="small"
            >
              <LeftOutlined />
            </Button>
          </Tooltip>
          {editRuleId ? (
            <span>Edit Rule / {editRule?.name}</span>
          ) : (
            <span>{groupId ? curRuleGroup?.name + ' / ' : ''}Create New Rule</span>
          )}
        </Flex>
        <div>
          <Switch
            style={{ marginRight: '10px' }}
            checkedChildren="Enabled"
            unCheckedChildren="Disabled"
            checked={ruleEnable}
            onChange={(checked) => setRuleEnable(checked)}
          ></Switch>
          <Button type="primary" form="addRuleForm">
            Save
          </Button>
        </div>
      </div>
      <div style={{ padding: '4px 36px', overflowY: 'auto' }}>
        <Input
          size="large"
          placeholder="Add Rule Name"
          style={{ marginBottom: '8px' }}
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
        />
        <Input.TextArea
          size="large"
          placeholder="Add Description (Optional)"
          style={{ marginBottom: '16px' }}
          value={ruleDesc}
          onChange={(e) => setRuleDesc(e.target.value)}
        />
        <div className="paper-block e2">
          <h3>If Request Match:</h3>
          <Flex gap={1} style={{ paddingBottom: '4px' }}>
            <Select
              size="large"
              defaultValue="url"
              value={matchType}
              options={[
                { label: 'URL', value: 'url' },
                { label: 'Host', value: 'host' },
                { label: 'Path', value: 'path' }
              ]}
              onChange={(value) => setMatchType(value)}
            />
            <Select
              size="large"
              defaultValue="contains"
              value={matchMode}
              options={[
                { label: 'Contains', value: 'contains' },
                { label: 'Equals', value: 'equals' },
                { label: 'Matches(Regex)', value: 'matches' }
              ]}
              onChange={(value) => setMatchMode(value)}
            />
            <Input
              style={{ flex: 1 }}
              value={matchValue}
              onChange={(e) => setMatchValue(e.target.value)}
            />
            <Tooltip title="Test macth rules">
              <ExperimentOutlined style={{ fontSize: '20px', marginLeft: '8px' }} />
            </Tooltip>
            <Tooltip title="Request methods filter">
              <DownCircleOutlined
                onClick={() => setShowReqMethodsFilter(!showReqMethodsFilter)}
                style={{
                  fontSize: '20px',
                  marginLeft: '8px',
                  rotate: showReqMethodsFilter ? '180deg' : 'none'
                }}
              />
            </Tooltip>
          </Flex>
          {showReqMethodsFilter && (
            <Select
              allowClear
              size="large"
              mode="multiple"
              placeholder="Select methods (leave empty to match all)"
              value={matchMethods}
              onChange={setMatchMethods}
              style={{ width: '100%', marginTop: '8px' }}
              options={reqMethods}
            />
          )}
        </div>
        <Dropdown
          menu={{
            items: AddRulesMenu,
            onClick: (item) => handleAddRuleClick(item.key as RuleType)
          }}
        >
          <Button type="primary" style={{ margin: '8px 0' }}>
            <Space>
              Add Rules
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <div className="paper-block e2">
          {modifyList.map((rule, index) => (
            <Flex key={index} vertical style={{ width: '100%' }}>
              <Tooltip title="remove rule" placement="top" arrow>
                <Button
                  size="small"
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                  onClick={() => removeRule(index)}
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
              {getAddRuleValueComponent(rule)}
            </Flex>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NewRulePage
