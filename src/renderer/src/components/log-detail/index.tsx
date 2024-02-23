import './log-detail.less'

import { SyntheticEvent, useState } from 'react'
import { Log } from 'src/common/contract'

import ReactJson from '@microlink/react-json-view'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import { Box, Stack, Typography } from '@mui/material'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary'
import { styled } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

interface LogDetailProps {
  log: Log
}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0
  },
  '&::before': {
    display: 'none'
  }
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)'
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1)
  }
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)'
}))

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      aria-labelledby={`log-tab-${index}`}
      className="log-tab-panel"
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  )
}

interface LogObjBlockProps {
  data: Record<string, string>
}

function LogObjBlock({ data }: LogObjBlockProps) {
  return Object.keys(data).map((key) => (
    <div className="log-block-item" key={key}>
      <span className="block-label">{key}: </span>
      <span className="block-value">{data[key]}</span>
    </div>
  ))
}

function LogDetail({ log }: LogDetailProps): JSX.Element {
  const [value, setValue] = useState(0)

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  return (
    <>
      <Tabs aria-label="log detail tab" onChange={handleTabChange} value={value}>
        <Tab label="Request"></Tab>
        <Tab label="Response"></Tab>
        <Tab label="Preview"></Tab>
      </Tabs>
      <TabPanel value={value} index={0}>
        <Accordion defaultExpanded={true}>
          <AccordionSummary>
            <Typography>General:</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Typography>Request URL: {log.url}</Typography>
              <Typography>Request Method: {log.method}</Typography>
              <Typography>Remote Address: {`${log.remoteIp}:${log.remotePort}`}</Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
          <AccordionSummary>
            <Typography>Request Header:</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LogObjBlock data={log.requestHeaders} />
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
          <AccordionSummary>
            <Typography>Request Parameters:</Typography>
          </AccordionSummary>
          <AccordionDetails></AccordionDetails>
        </Accordion>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Accordion defaultExpanded={true}>
          <AccordionSummary>
            <Typography>General:</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Typography>Status Code: {log.status}</Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
          <AccordionSummary>
            <Typography>Response Header:</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LogObjBlock data={log.responseHeaders} />
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
          <AccordionSummary>
            <Typography>Response Body:</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="raw-content">{log.responseBodyInfo?.bodyText}</div>
          </AccordionDetails>
        </Accordion>
      </TabPanel>
      <TabPanel value={value} index={2}>
        {log.responseBodyInfo?.isJson && (
          <ReactJson src={log.responseBodyInfo?.data} theme="monokai" displayDataTypes={false} />
        )}
        {log.responseBodyInfo?.type === 'img' && (
          <img src={log.responseBodyInfo?.data} alt="preview" />
        )}
        {log.responseBodyInfo?.type === 'html' && (
          <iframe
            className="iframe-preview"
            sandbox=""
            frameBorder={0}
            srcDoc={log.responseBodyInfo?.data}
            title="preview"
          />
        )}
      </TabPanel>
    </>
  )
}

export default LogDetail
