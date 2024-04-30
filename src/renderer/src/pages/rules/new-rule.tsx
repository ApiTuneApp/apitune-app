import '@renderer/components/add-rule-item/index.less'

import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowDropDownCircleOutlinedIcon from '@mui/icons-material/ArrowDropDownCircleOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  Input,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
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
import { use } from 'marked'

const reqMethods = ReqMethods.map((item) => ({
  label: item
}))

const AddRulesMenu: RuleMenuItem[] = [
  { type: RuleType.Redirect, label: 'ReDirect' },
  { type: RuleType.SpeedLimit, label: 'Add Speed Limit' },
  { type: RuleType.RequestHeader, label: 'Modify Request Headers' },
  { type: RuleType.RequestBody, label: 'Modify Request Body' },
  { type: RuleType.RequestFunction, label: 'Add Request Function' },
  { type: RuleType.ResponseHeader, label: 'Modify Response Headers' },
  { type: RuleType.ResponseBody, label: 'Modify Response Body' },
  { type: RuleType.ResponseDelay, label: 'Add Response Delay' },
  // { type: Rules.ResponseFile, label: 'Replace Response With File' },
  { type: RuleType.ResponseFunction, label: 'Add Response Function' },
  { type: RuleType.ResponseStatus, label: 'Modify Response Status' }
]

type RuleMenuItem = {
  type: RuleType
  label: string
}

function NewRulePage(): JSX.Element {
  const navigate = useNavigate()
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
        editRule.changeList.map((rule) => ({
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
  const [addRuleAnchorEl, setAddRuleAnchorEl] = useState<null | HTMLElement>(null)
  const addRuleOpen = Boolean(addRuleAnchorEl)
  const [changeList, setChangeList] = useState<RuleItem[]>([])

  const [addRuleResult, setAddRuleResult] = useState<IpcResult>()

  const handleAddRuleClose = () => {
    setAddRuleAnchorEl(null)
  }

  const showAddRuleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddRuleAnchorEl(event.currentTarget)
  }

  const handleAddRuleClick = (rule: RuleMenuItem) => {
    setAddRuleAnchorEl(null)
    const initValue: RuleItem = { type: rule.type, value: '', valid: false }
    if (rule.type === RuleType.ResponseStatus) {
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
    changeList.forEach((rule) => {
      if (rule.validator) {
        rule.validator(rule.value)
      }
    })
    const formValid = changeList.every((rule) => rule.valid)
    if (!ruleName) {
      setAddRuleResult({
        status: EventResultStatus.Error,
        error: 'Rule name is required'
      })
      return
    }
    if (formValid) {
      if (editRuleId) {
        if (!editRule) {
          setAddRuleResult({
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
            changeList: changeList.map((rule) => ({
              type: rule.type,
              value: rule.value,
              enable: true
            }))
          })
        )
        setAddRuleResult(result)
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
            changeList: changeList.map((rule) => ({
              type: rule.type,
              value: rule.value,
              enable: true
            }))
          }),
          { groupId: groupId as string }
        )
        setAddRuleResult(result)
      }
    }
  }

  const removeRule = (index: number) => {
    const newRules = changeList.filter((_, i) => i !== index)
    setChangeList(newRules)
  }

  const handleResultClose = () => {
    setAddRuleResult(undefined)
    if (addRuleResult?.status === EventResultStatus.Success) {
      RuleService.getApiRules()
      navigate(-1)
    }
  }

  return (
    <Box
      className="page-new"
      sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}
    >
      <Box
        sx={{ pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        color="var(--ev-c-text-2)"
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Go back">
            <IconButton onClick={() => navigate(-1)} color="inherit" size="small">
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {editRuleId ? (
            <Typography ml={1}>Edit Rule / {editRule?.name}</Typography>
          ) : (
            <Typography ml={1}>
              {groupId ? curRuleGroup?.name + ' / ' : ''}Create New Rule
            </Typography>
          )}
        </Box>
        <Box>
          <FormControlLabel
            sx={{ pr: 2 }}
            control={
              <Switch
                checked={ruleEnable}
                onChange={(e) => setRuleEnable(e.target.checked)}
              ></Switch>
            }
            labelPlacement="start"
            label={ruleEnable ? 'Enabled' : 'Disabled'}
          />
          <Button color="primary" variant="contained" size="small" type="submit" form="addRuleForm">
            Save
          </Button>
        </Box>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={!!addRuleResult}
        autoHideDuration={1500}
        onClose={handleResultClose}
      >
        {addRuleResult && (
          <Alert
            onClose={handleResultClose}
            severity={addRuleResult?.status === EventResultStatus.Success ? 'success' : 'error'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {addRuleResult?.status === EventResultStatus.Success
              ? `Rule ${editRuleId ? 'edited' : 'added'} successfully`
              : 'Error: ' + addRuleResult?.error}
          </Alert>
        )}
      </Snackbar>

      <Box sx={{ pt: 1, px: 8, overflowY: 'auto' }}>
        <TextField
          fullWidth
          label="Add Rule Name"
          size="small"
          sx={{ pb: 2 }}
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
        />
        <Input
          fullWidth
          multiline
          placeholder="Add Description (Optional)"
          size="small"
          disableUnderline
          sx={{ pb: 4 }}
          value={ruleDesc}
          onChange={(e) => setRuleDesc(e.target.value)}
        />
        <Paper elevation={3} sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">If Request Match:</Typography>
          <Stack flexDirection="row" gap={1} sx={{ pt: 1 }}>
            <Select
              size="small"
              defaultValue="url"
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
            >
              <MenuItem value="url">URL</MenuItem>
              <MenuItem value="host">Host</MenuItem>
              <MenuItem value="path">Path</MenuItem>
            </Select>
            <Select
              size="small"
              defaultValue="contains"
              value={matchMode}
              onChange={(e) => setMatchMode(e.target.value)}
            >
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="matches">Matches(Regex)</MenuItem>
            </Select>
            <TextField
              size="small"
              sx={{ flex: 1 }}
              value={matchValue}
              onChange={(e) => setMatchValue(e.target.value)}
            />
            <Tooltip title="Test macth rules">
              <IconButton>
                <ScienceOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Request methods filter">
              <IconButton onClick={() => setShowReqMethodsFilter(!showReqMethodsFilter)}>
                <ArrowDropDownCircleOutlinedIcon
                  sx={{ rotate: showReqMethodsFilter ? '180deg' : 'none' }}
                />
              </IconButton>
            </Tooltip>
          </Stack>
          {showReqMethodsFilter && (
            <Paper elevation={1} sx={{ p: 1, mt: 1 }}>
              <Autocomplete
                multiple
                size="small"
                options={reqMethods}
                value={matchMethods.map((item) => ({ label: item }))}
                onChange={(_, value) => setMatchMethods(value.map((item) => item.label))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Request methods:"
                    variant="standard"
                    placeholder="Select methods (leave empty to match all)"
                    size="small"
                  />
                )}
              />
            </Paper>
          )}
        </Paper>
        <Button
          aria-haspopup="true"
          aria-controls={addRuleOpen ? 'add-rule-menu' : undefined}
          aria-expanded={addRuleOpen ? 'true' : undefined}
          disableElevation
          variant="contained"
          sx={{ my: 2 }}
          endIcon={<KeyboardArrowDownIcon />}
          onClick={showAddRuleMenu}
        >
          Add Rules
        </Button>
        <Menu
          id="add-rule-menu"
          anchorEl={addRuleAnchorEl}
          open={addRuleOpen}
          onClose={handleAddRuleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button'
          }}
        >
          {AddRulesMenu.map((rule) => (
            <MenuItem
              onClick={() => handleAddRuleClick(rule)}
              key={rule.type}
              disabled={changeList.some((item) => item.type === rule.type)}
            >
              {rule.label}
            </MenuItem>
          ))}
        </Menu>
        <Paper
          elevation={3}
          component="form"
          onSubmit={handleAddRuleSubmit}
          id="addRuleForm"
          noValidate
        >
          {changeList.map((rule, index) => (
            <FormControl key={index} fullWidth>
              <Tooltip title="remove rule" placement="top" arrow onClick={() => removeRule(index)}>
                <IconButton size="small" sx={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {getAddRuleValueComponent(rule)}
            </FormControl>
          ))}
        </Paper>
      </Box>
    </Box>
  )
}

export default NewRulePage
