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
import { useUxStore } from '@renderer/store/ux'
import { Log } from '@shared/contract'

const appSidebarWidth = 76
const appHeaderHeight = 40
const networkPagePadding = 40
const MinDrawerHeight = 20
const MaxDarwerHeight = 1000
const QueryIconSize = 16

function NetworkPage(): JSX.Element {
  const proxyLogs = useUxStore((state) => state.proxyLogs)
  const handleClearLog = useUxStore((state) => state.clearProxyLogs)
  const recordPaused = useUxStore((state) => state.logPaused)
  const setRecordPaused = useUxStore((state) => state.setLogPaused)

  const stopRecordStr = 'Stop recording network log'
  const startRecordStr = 'Record network log'
  const [pauseBtnText, setPauseBtnText] = useState(stopRecordStr)
  const [resultLogs, setResultLogs] = useState<Log[]>([])
  const [curLog, setCurLog] = useState<Log | undefined>()
  const [drawerHeight, setDrawerHeight] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (item) => (
        <Tooltip placement="topLeft" title={item}>
          {item}
        </Tooltip>
      ),
      width: 300
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 80
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      ellipsis: true,
      render: (item) => (
        <Tooltip placement="topLeft" title={item}>
          {item}
        </Tooltip>
      )
    },
    {
      title: 'Path',
      dataIndex: 'pathname',
      key: 'pathname',
      ellipsis: true,
      render: (item) => (
        <Tooltip placement="topLeft" title={item}>
          {item}
        </Tooltip>
      )
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
      width: 60
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
    if (searchValue) {
      setResultLogs(proxyLogs.filter((log) => log.url.includes(searchValue)))
    } else {
      setResultLogs(proxyLogs)
    }
  }, [proxyLogs])

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
    if (newHeight > MinDrawerHeight && newHeight < MaxDarwerHeight) {
      setDrawerHeight(newHeight)
    }
  }, [])

  const handleDrawerClose = () => {
    setDrawerHeight(0)
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
    console.log('cur log', record)
    setDrawerHeight(400)
  }

  const tableHeight =
    document.body.offsetHeight - drawerHeight - appHeaderHeight - networkPagePadding

  const tableWidth = document.body.offsetWidth - appSidebarWidth - networkPagePadding

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
            <ClearOutlined onClick={handleClearLog} style={{ fontSize: QueryIconSize }} />
          </Tooltip>
          <Tooltip title={pauseBtnText}>
            {recordPaused ? (
              <PlayCircleOutlined onClick={handlePauseClick} style={{ fontSize: QueryIconSize }} />
            ) : (
              <PauseCircleOutlined onClick={handlePauseClick} style={{ fontSize: QueryIconSize }} />
            )}
          </Tooltip>
          {/* <Tooltip title="Config network column">
            <ControlOutlined style={{ fontSize: QueryIconSize }} />
          </Tooltip> */}
        </Space>
      </Flex>
      <Table
        className="network-table"
        size="small"
        rowKey="id"
        virtual
        columns={columns}
        dataSource={resultLogs}
        pagination={false}
        scroll={{ x: tableWidth, y: tableHeight }}
        rowClassName={(record) => {
          return curLog && record.id === curLog.id ? 'ant-table-row-selected' : ''
        }}
        style={{ height: `calc(100% - ${drawerHeight}px)` }}
        onRow={(record) => {
          return {
            onClick: (event) => {
              handleRowClick(record)
            }
          }
        }}
      ></Table>
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
