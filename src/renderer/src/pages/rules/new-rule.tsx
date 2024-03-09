import { useNavigate } from 'react-router-dom'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import ArrowDropDownCircleOutlinedIcon from '@mui/icons-material/ArrowDropDownCircleOutlined'
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Input,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { useState } from 'react'

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

function NewRulePage(): JSX.Element {
  const navigate = useNavigate()
  const [showReqMethodsFilter, setShowReqMethodsFilter] = useState(false)

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
        <Button color="primary" variant="contained" size="small">
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
          inputProps={{ disableUnderline: true }}
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
      </Box>
    </Box>
  )
}

export default NewRulePage
