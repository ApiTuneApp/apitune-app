import '@glideapps/glide-data-grid/dist/index.css'
import './network.less'

import { useCallback, useEffect, useState } from 'react'

import {
  DataEditor,
  GridCell,
  GridCellKind,
  GridColumn,
  GridSelection,
  Highlight,
  Item
} from '@glideapps/glide-data-grid'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { IconButton, Stack, TextField, Tooltip } from '@mui/material'

import { Log, MainEvent } from '../../../../common/contract'

function NetworkPage(): JSX.Element {
  const [recordPaused, setRecordPaused] = useState(false)
  const stopRecordStr = 'Stop recording network log'
  const startRecordStr = 'Record network log'
  const [pauseBtnText, setPauseBtnText] = useState(stopRecordStr)
  const [columns, setColumns] = useState<GridColumn[]>([
    { title: 'Protocol', id: 'protocol' },
    { title: 'Host', id: 'host', width: 160 },
    { title: 'Path', id: 'pathname', width: 200 },
    { title: 'Method', id: 'method', width: 90 },
    { title: 'Status', id: 'status', width: 90 },
    { title: 'MatchRules', id: 'matchedRules' },
    { title: 'Time', id: 'time', width: 80 }
  ])
  const [highlightRegions, setHighlightRegions] = useState<Highlight[]>()
  const [proxyLogs, setProxyLogs] = useState<Log[]>([])

  const highlightColor = '#357edd'

  useEffect(() => {
    window.api.onProxyLog((log) => {
      setProxyLogs((prev) => [...prev, log])
    })

    return () => {
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

  const onGridSelectionChange = (newSelection: GridSelection) => {
    if (newSelection.current !== undefined) {
      setHighlightRegions([
        {
          color: highlightColor,
          range: {
            x: 0,
            y: newSelection.current.range.y,
            width: columns.length,
            height: 1
          }
        }
      ])
    } else {
      setHighlightRegions(undefined)
    }
  }

  return (
    <Stack className="app-page page-network" direction="column">
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
            accentLight: highlightColor,
            bgCell: '#222222',
            bgHeader: '#222222',
            bgHeaderHovered: 'rgba(235, 235, 245, 0.38)',
            bgHeaderHasFocus: 'rgba(235, 235, 245, 0.38)',
            textHeader: 'rgba(255, 255, 245, 0.86)',
            textDark: 'rgba(255, 255, 245, 0.86)'
          }}
          columns={columns}
          rows={proxyLogs.length}
          rangeSelect="none"
          rowSelect="single"
          columnSelect="none"
          drawFocusRing={false}
          width="100%"
          height="calc(100vh - 150px)"
          smoothScrollX={true}
          smoothScrollY={true}
          highlightRegions={highlightRegions}
          getCellContent={getContent}
          onColumnResize={onColumnResize}
          onGridSelectionChange={onGridSelectionChange}
        />
      )}
    </Stack>
  )
}

export default NetworkPage
