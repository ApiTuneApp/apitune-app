import '@glideapps/glide-data-grid/dist/index.css'
import './network.less'

import { useCallback, useState } from 'react'
import { Box, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import { DataEditor, GridCell, GridCellKind, GridColumn, Item } from '@glideapps/glide-data-grid'

function NetworkPage(): JSX.Element {
  const [recordPaused, setRecordPaused] = useState(false)
  const stopRecordStr = 'Stop recording network log'
  const startRecordStr = 'Record network log'
  const [pauseBtnText, setPauseBtnText] = useState(stopRecordStr)

  // If fetching data is slow you can use the DataEditor ref to send updates for cells
  // once data is loaded.
  const getContent = useCallback((cell: Item): GridCell => {
    const [col, row] = cell
    const dataRow = data[row]
    // dumb but simple way to do this
    const indexes = ['id', 'protocol', 'host', 'path', 'type', 'time', 'size']
    const d = dataRow[indexes[col]]
    return {
      kind: GridCellKind.Text,
      allowOverlay: false,
      displayData: d,
      data: d
    }
  }, [])
  const data = [
    {
      id: '1',
      protocol: 'https',
      host: 'example.com',
      path: '/path1',
      type: 'GET',
      time: '1.2s',
      size: '1.2KB'
    },
    {
      id: '1',
      protocol: 'https',
      host: 'example.com',
      path: '/path?a=1&b=2',
      type: 'GET',
      time: '1.2s',
      size: '1.2KB'
    },
    {
      id: '1',
      protocol: 'https',
      host: 'example.com',
      path: '/path2?a=1',
      type: 'GET',
      time: '1.2s',
      size: '1.2KB'
    }
  ]
  // Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
  const columns: GridColumn[] = [
    {
      title: 'Id',
      id: 'id'
    },
    {
      title: 'Protocol',
      id: 'protocol'
    },
    {
      title: 'Host',
      id: 'host'
    },
    {
      title: 'Path',
      id: 'path'
    },
    {
      title: 'Type',
      id: 'type'
    },
    {
      title: 'Time',
      id: 'time'
    },
    {
      title: 'Size',
      id: 'size'
    }
  ]

  const onPauseClick = function () {
    setPauseBtnText(!recordPaused ? startRecordStr : pauseBtnText)
    setRecordPaused(!recordPaused)
  }

  return (
    <Box className="app-page page-network">
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
        rows={data.length}
      />
    </Box>
  )
}

export default NetworkPage
