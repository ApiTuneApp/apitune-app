import '@glideapps/glide-data-grid/dist/index.css'
import './network.less'

import { useCallback, useEffect, useState } from 'react'
import { Box, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { DataEditor, GridCell, GridCellKind, GridColumn, Item } from '@glideapps/glide-data-grid'
import { Log, MainEvent } from '../../../../common/contract'

function NetworkPage(): JSX.Element {
  const [recordPaused, setRecordPaused] = useState(false)
  const stopRecordStr = 'Stop recording network log'
  const startRecordStr = 'Record network log'
  const [pauseBtnText, setPauseBtnText] = useState(stopRecordStr)
  const [columns, setColumns] = useState<GridColumn[]>([
    { title: 'Protocol', id: 'protocol' },
    { title: 'Host', id: 'host', width: 140 },
    { title: 'Path', id: 'pathname' },
    { title: 'Method', id: 'method', width: 90 },
    { title: 'Status', id: 'status', width: 90 },
    { title: 'MatchRules', id: 'matchedRules' },
    { title: 'Time', id: 'time', width: 80 }
  ])

  const [proxyLogs, setProxyLogs] = useState<Log[]>([])

  useEffect(() => {
    console.log('useEffect call')
    window.api.onProxyLog((log) => {
      console.log('receive log ===> ', log)
      setProxyLogs((prev) => [...prev, log])
    })

    return () => {
      console.log('useEffect cleanup')
      window.api.clearupMainEvent(MainEvent.ProxyLog)
    }
  }, [])

  // If fetching data is slow you can use the DataEditor ref to send updates for cells
  // once data is loaded.
  const getContent = (cell: Item): GridCell => {
    const [col, row] = cell
    const dataRow = proxyLogs[row]
    const column = columns[col]
    let data = ''
    if (column && dataRow) {
      switch (column.id) {
        case 'time':
          data = dataRow.finishTime ? `${dataRow.finishTime - dataRow.startTime}ms` : ''
          break
        case 'matchedRules':
          data = dataRow.matchedRules.join(',')
          break
        default:
          data = dataRow[column.id as string]
          break
      }
    }
    if (!data) {
      data = ''
    }
    return {
      kind: GridCellKind.Text,
      allowOverlay: false,
      displayData: data.toString(),
      data
    }
  }

  const onPauseClick = function () {
    setPauseBtnText(!recordPaused ? startRecordStr : pauseBtnText)
    setRecordPaused(!recordPaused)
  }

  const onColumnResize = useCallback(
    (col: GridColumn, newSize: number) => {
      const index = columns.indexOf(col)
      const newCols = [...columns]
      newCols[index] = {
        ...newCols[index],
        width: newSize
      }
      setColumns(newCols)
    },
    [columns]
  )

  return (
    <Box className="app-page page-network">
      <Stack direction="column">
        <Stack sx={{ pb: '10px' }} direction="row">
          <TextField
            size="small"
            className="app-control app-input network-input"
            label="Search URL"
          />
          <Tooltip title="Clear network log">
            <IconButton aria-label="clear network log">
              <BlockOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={pauseBtnText}>
            <IconButton aria-label={pauseBtnText} onClick={onPauseClick}>
              {recordPaused ? (
                <PlayCircleFilledWhiteOutlinedIcon />
              ) : (
                <PauseCircleOutlineOutlinedIcon />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Config network column">
            <IconButton aria-label="Config network column">
              <TuneOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        {proxyLogs.length > 0 && (
          <DataEditor
            className="network-table"
            theme={{
              bgCell: '#222222',
              bgHeader: '#222222',
              fgIconHeader: '#282828',
              bgHeaderHovered: 'rgba(235, 235, 245, 0.38)',
              bgHeaderHasFocus: 'rgba(235, 235, 245, 0.38)',
              textHeader: 'rgba(255, 255, 245, 0.86)',
              textDark: 'rgba(255, 255, 245, 0.86)'
            }}
            getCellContent={getContent}
            columns={columns}
            rows={proxyLogs.length}
            drawFocusRing={false}
            width="100%"
            smoothScrollX={true}
            smoothScrollY={true}
            onColumnResize={onColumnResize}
          />
        )}
      </Stack>
    </Box>
  )
}

export default NetworkPage
