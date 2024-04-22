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
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { Drawer, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import LogDetail from '@renderer/components/log-detail'

import { Log, MainEvent } from '../../../../shared/contract'

const minDrawerHeight = 20
const maxDarwerHeight = 1000

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
  const [resultLogs, setResultLogs] = useState<Log[]>([])
  const [curLog, setCurLog] = useState<Log | undefined>()
  const [drawerHeight, setDrawerHeight] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  const highlightColor = '#357edd'

  useEffect(() => {
    window.api.onProxyLog((log) => {
      if (recordPaused) return
      setProxyLogs((prev) => [...prev, log])
      if (searchValue && log.url.includes(searchValue)) {
        setResultLogs((prev) => [...prev, log])
      } else {
        setResultLogs((prev) => [...prev, log])
      }
    })

    return () => {
      window.api.clearupEvent(MainEvent.ProxyLog)
    }
  }, [])

  // If fetching data is slow you can use the DataEditor ref to send updates for cells
  // once data is loaded.
  const getContent = (cell: Item): GridCell => {
    const [col, row] = cell
    const dataRow = resultLogs[row]
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
    return {
      kind: GridCellKind.Text,
      allowOverlay: false,
      displayData: data.toString(),
      data
    }
  }

  const handlePauseClick = function () {
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
      console.log('cur log', resultLogs[newSelection.current.range.y])
      setCurLog(resultLogs[newSelection.current.range.y])
      setDrawerHeight(400)
    } else {
      setHighlightRegions(undefined)
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    document.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('mousemove', handleMouseMove, true)
  }, [])

  const handleMouseUp = () => {
    document.removeEventListener('mouseup', handleMouseUp, true)
    document.removeEventListener('mousemove', handleMouseMove, true)
  }

  const handleMouseMove = useCallback((e) => {
    const newHeight = document.body.offsetHeight - e.clientY - 22
    if (newHeight > minDrawerHeight && newHeight < maxDarwerHeight) {
      setDrawerHeight(newHeight)
    }
  }, [])

  const handleDrawerClose = () => {
    setDrawerHeight(0)
  }

  const handleClearLog = () => {
    setProxyLogs([])
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    if (e.target.value) {
      setResultLogs(proxyLogs.filter((log) => log.url.includes(e.target.value)))
    } else {
      setResultLogs(proxyLogs)
    }
  }

  return (
    <Stack className="app-page page-network" direction="column">
      <Stack sx={{ pb: '10px' }} direction="row">
        <TextField
          size="small"
          className="app-control app-input network-input"
          label="Search URL"
          value={searchValue}
          onChange={handleSearchChange}
        />
        <Tooltip title="Clear network log">
          <IconButton aria-label="clear network log" onClick={handleClearLog}>
            <BlockOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={pauseBtnText}>
          <IconButton aria-label={pauseBtnText} onClick={handlePauseClick}>
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
          rows={resultLogs.length}
          rowMarkers="number"
          rangeSelect="none"
          rowSelect="single"
          columnSelect="none"
          drawFocusRing={false}
          width="100%"
          height="auto"
          smoothScrollX={true}
          smoothScrollY={true}
          overscrollY={50}
          highlightRegions={highlightRegions}
          getCellContent={getContent}
          onColumnResize={onColumnResize}
          onGridSelectionChange={onGridSelectionChange}
        />
      )}
      <Drawer
        anchor="bottom"
        open={!!curLog && drawerHeight > 0}
        variant="persistent"
        PaperProps={{
          elevation: 2,
          sx: {
            position: 'relative',
            height: drawerHeight
          }
        }}
      >
        <div className="bottom-resizer" onMouseDown={handleMouseDown}>
          <CloseOutlinedIcon className="bottom-drawer-close" onClick={handleDrawerClose} />
          <DragIndicatorOutlinedIcon className="bottom-resizer-icon" fontSize="small" />
        </div>
        <div className="network-detail">{curLog && <LogDetail log={curLog} />}</div>
      </Drawer>
    </Stack>
  )
}

export default NetworkPage
