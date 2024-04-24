import * as React from 'react'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import { useRuleStore } from '@renderer/store'
import { RuleData, ApiRuleItem, RuleGroup } from '@shared/contract'
import { NavLink } from 'react-router-dom'

interface RowProps {
  rule: ApiRuleItem
  triggerRuleEnable: (rule: ApiRuleItem, enable: boolean) => void
}

function Row({ rule, triggerRuleEnable }: RowProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          {rule.rules.length > 0 ? (
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
        <TableCell>
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
                    <TableCell>Name</TableCell>
                    <TableCell>description</TableCell>
                    <TableCell>Enable</TableCell>
                    <TableCell>Updated on</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rule as RuleGroup).rules.map((r: RuleData) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <NavLink to={`/rules/edit/${r.id}`}>{r.name}</NavLink>
                      </TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enable}
                          size="small"
                          onChange={(e) => triggerRuleEnable(rule, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>Jan 04, 2024</TableCell>
                      <TableCell>
                        <Button size="small">Rename</Button>
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
      </TableRow>
    </React.Fragment>
  )
}

function RuleListPage(): JSX.Element {
  const apiRules = useRuleStore((state) => state.apiRules)

  function triggerRuleEnable(rule, enabled) {
    console.log(rule, enabled)
  }

  return (
    <Box className="page-list" sx={{ py: 2, px: 6, height: '100%' }}>
      <Table>
        <colgroup>
          <col width="5%" />
          <col width="20%" />
          <col width="20%" />
          <col width="20%" />
          <col width="35%" />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell>Enabled</TableCell>
            <TableCell>Updated on</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {apiRules.map((rule) => (
            <Row key={rule.id} rule={rule} triggerRuleEnable={triggerRuleEnable} />
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

export default RuleListPage
