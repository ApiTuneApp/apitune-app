import '@renderer/components/add-rule-item/index.less'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Rules } from '@common/contract'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowDropDownCircleOutlinedIcon from '@mui/icons-material/ArrowDropDownCircleOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { RuleItem } from '@renderer/components/add-rule-item/contract'
import Redirect from '@renderer/components/add-rule-item/redirect'

const reqMethods = [
  { label: 'GET' },
  { label: 'POST' },
  { label: 'PUT' },
  { label: 'DELETE' },
  { label: 'HEAD' },
  { label: 'OPTIONS' },
  { label: 'PATCH' },
  { label: 'CONNECT' }
]

const AddRulesMenu: RuleMenuItem[] = [
  { type: Rules.Redirect, label: 'ReWrite' },
  { type: Rules.RequestHeader, label: 'Change request headers' },
  { type: Rules.RequestBody, label: 'Change request body' },
  { type: Rules.RequestFunction, label: 'Add request function' },
  { type: Rules.ResponseBody, label: 'Change response body' },
  { type: Rules.ResponseDelay, label: 'Add response delay' },
  { type: Rules.ResponseFile, label: 'Replace response with file' },
  { type: Rules.ResponseFunction, label: 'Add response function' },
  { type: Rules.ResponseStatus, label: 'Change response status' }
]

type RuleMenuItem = {
  type: Rules
  label: string
}

function NewRulePage(): JSX.Element {
  const navigate = useNavigate()
  const [showReqMethodsFilter, setShowReqMethodsFilter] = useState(false)
  const [addRuleAnchorEl, setAddRuleAnchorEl] = useState<null | HTMLElement>(null)
  const addRuleOpen = Boolean(addRuleAnchorEl)
  const [addedRules, setAddedRules] = useState<RuleItem[]>([])

  const handleAddRuleClose = () => {
    setAddRuleAnchorEl(null)
  }

  const showAddRuleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddRuleAnchorEl(event.currentTarget)
  }

  const handleAddRuleClick = (rule: RuleMenuItem) => {
    setAddRuleAnchorEl(null)
    setAddedRules((prevRules) => [...prevRules, { type: rule.type, value: '', valid: false }])
  }

  // there should only one type in rule list
  const getSetValueMethod = (rule: RuleItem) => {
    return (value: RuleItem['value']) => {
      const newRules = addedRules.map((r) => {
        if (r.type === rule.type) {
          return { ...r, value }
        }
        return r
      })
      setAddedRules(newRules)
    }
  }

  const getAddRuleValueComponent = (rule: RuleItem) => {
    const type = rule.type
    const setValue = getSetValueMethod(rule)
    switch (type) {
      case Rules.Redirect:
        return <Redirect rule={rule} setValue={setValue} />
      default:
        return <h2>{type} not accomplished yet!</h2>
    }
  }

  const handleAddRuleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addedRules.forEach((rule) => {
      if (rule.validator) {
        rule.validator(rule.value)
      }
    })
    const formValid = addedRules.every((rule) => rule.valid)
    if (formValid) {
      console.log('form is valid')
    }
    console.log(addedRules)
  }

  return (
    <Box className="page-new" sx={{ height: '100%', p: 2 }}>
      <Box
        sx={{ pb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        color="var(--ev-c-text-2)"
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Go back">
            <IconButton onClick={() => navigate(-1)} color="inherit" size="small">
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography ml={1}>Create New Rule</Typography>
        </Box>
        <Button color="primary" variant="contained" size="small" type="submit" form="addRuleForm">
          Save
        </Button>
      </Box>

      <Box sx={{ px: 16 }}>
        <TextField fullWidth label="Add Rule Name" size="small" sx={{ pb: 2 }} />
        <Input
          fullWidth
          multiline
          placeholder="Add Description (Optional)"
          size="small"
          disableUnderline
          sx={{ pb: 4 }}
        />
        <Paper elevation={3} sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">If Request Match:</Typography>
          <Stack flexDirection="row" gap={1} sx={{ pt: 1 }}>
            <Select size="small" defaultValue="url">
              <MenuItem value="url">URL</MenuItem>
              <MenuItem value="host">Host</MenuItem>
              <MenuItem value="path">Path</MenuItem>
            </Select>
            <Select size="small" defaultValue="contains">
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="matches">Matches(Regex)</MenuItem>
            </Select>
            <TextField size="small" sx={{ flex: 1 }} />
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
            <MenuItem onClick={() => handleAddRuleClick(rule)} key={rule.type}>
              {rule.label}
            </MenuItem>
          ))}
        </Menu>
        <Box component="form" onSubmit={handleAddRuleSubmit} id="addRuleForm" noValidate>
          {addedRules.map((rule, index) => (
            <FormControl key={index} fullWidth>
              {getAddRuleValueComponent(rule)}
            </FormControl>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default NewRulePage
