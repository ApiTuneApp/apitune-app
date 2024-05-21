import '@glideapps/glide-data-grid/dist/index.css'
import './network.less'

import { Flex, Input, Space, Table, Tooltip } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import {
  ClearOutlined,
  CloseOutlined,
  ControlOutlined,
  HolderOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import LogDetail from '@renderer/components/log-detail'
import { Log, MainEvent } from '@shared/contract'

const minDrawerHeight = 20
const maxDarwerHeight = 1000

function NetworkPage(): JSX.Element {
  const [recordPaused, setRecordPaused] = useState(false)
  const stopRecordStr = 'Stop recording network log'
  const startRecordStr = 'Record network log'
  const [pauseBtnText, setPauseBtnText] = useState(stopRecordStr)
  const [proxyLogs, setProxyLogs] = useState<Log[]>([])
  const [resultLogs, setResultLogs] = useState<Log[]>([])
  const [curLog, setCurLog] = useState<Log | undefined>()
  const [drawerHeight, setDrawerHeight] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  const columns = [
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol'
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      width: 160
    },
    {
      title: 'Path',
      dataIndex: 'pathname',
      key: 'pathname',
      width: 200
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 90
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90
    },
    {
      title: 'MatchRules',
      dataIndex: 'matchedRules',
      key: 'matchedRules',
      render(_, record: Log) {
        return record.matchedRules.join(',')
      }
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 80,
      render(_, record: Log) {
        return record.finishTime ? `${record.finishTime - record.startTime}ms` : ''
      }
    }
  ]

  useEffect(() => {
    window.api.onProxyLog((log) => {
      if (recordPaused) return
      setProxyLogs((prev) => [...prev, log])
      if (searchValue) {
        if (log.url.includes(searchValue)) {
          setResultLogs((prev) => [...prev, log])
        }
      } else {
        setResultLogs((prev) => [...prev, log])
      }
    })

    return () => {
      window.api.clearupEvent(MainEvent.ProxyLog)
    }
  }, [])

  const handlePauseClick = function () {
    setPauseBtnText(!recordPaused ? startRecordStr : pauseBtnText)
    setRecordPaused(!recordPaused)
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

  const handleRowClick = (record: Log) => {
    setCurLog(record)
    setDrawerHeight(400)
  }

  return (
    <Flex className="app-page page-network" vertical>
      <Flex gap={4} style={{ paddingBottom: '10px' }}>
        <Input
          placeholder="Search URL"
          className="app-control app-input network-input"
          value={searchValue}
          onChange={handleSearchChange}
        />
        <Space>
          <Tooltip title="Clear network log">
            <ClearOutlined onClick={handleClearLog} style={{ fontSize: 18 }} />
          </Tooltip>
          <Tooltip title={pauseBtnText}>
            {recordPaused ? (
              <PlayCircleOutlined onClick={handlePauseClick} style={{ fontSize: 18 }} />
            ) : (
              <PauseCircleOutlined onClick={handlePauseClick} style={{ fontSize: 18 }} />
            )}
          </Tooltip>
          <Tooltip title="Config network column">
            <ControlOutlined style={{ fontSize: 18 }} />
          </Tooltip>
        </Space>
      </Flex>
      {proxyLogs.length > 0 && (
        <Table
          size="small"
          rowKey="id"
          virtual
          columns={columns}
          dataSource={resultLogs}
          pagination={false}
          // rowSelection={{}}
          rowClassName={(record) => {
            return curLog && record.id === curLog.id ? 'ant-table-row-selected' : ''
          }}
          style={{ flex: 1, overflowY: 'auto' }}
          onRow={(record) => {
            return {
              onClick: (event) => {
                handleRowClick(record)
              }
            }
          }}
        ></Table>
      )}
      <div
        className="paper-block no-padding"
        style={{
          display: !!curLog && drawerHeight > 0 ? 'block' : 'none',
          position: 'relative',
          height: drawerHeight
        }}
      >
        <div className="bottom-resizer" onMouseDown={handleMouseDown}>
          <HolderOutlined className="bottom-resizer-icon" />
        </div>
        <CloseOutlined className="bottom-drawer-close" onClick={handleDrawerClose} />
        <div className="network-detail">{curLog && <LogDetail log={curLog} />}</div>
      </div>
    </Flex>
  )
}

export default NetworkPage
