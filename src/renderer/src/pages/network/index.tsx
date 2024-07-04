import './network.less'
import 'react-resizable/css/styles.css'

import { Flex, Input, Space, Table, Tooltip } from 'antd'
import { ColumnType } from 'antd/es/table'
import { useCallback, useEffect, useState } from 'react'
import { Resizable } from 'react-resizable'

import {
  ClearOutlined,
  CloseOutlined,
  HolderOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import LogDetail from '@renderer/components/log-detail'
import { useUxStore } from '@renderer/store/ux'
import { Log } from '@shared/contract'
import { findGroupOrRule } from '@shared/utils'
import { useRuleStore } from '@renderer/store'
import { NavLink } from 'react-router-dom'

const appHeaderHeight = 40
const networkPagePadding = 40
const MinDrawerHeight = 20
const MaxDarwerHeight = 1000
const QueryIconSize = 16

const ResizableTitle = (props: any) => {
  const { onResize, width, ...restProps } = props

  if (!width) {
    return <th {...restProps} />
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation()
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  )
}

function NetworkPage(): JSX.Element {
  const proxyLogs = useUxStore((state) => state.proxyLogs)
  const handleClearLog = useUxStore((state) => state.clearProxyLogs)
  const recordPaused = useUxStore((state) => state.logPaused)
  const setRecordPaused = useUxStore((state) => state.setLogPaused)

  const apiRules = useRuleStore((state) => state.apiRules)

  const stopRecordStr = 'Stop recording network log'
  const startRecordStr = 'Record network log'
  const [pauseBtnText, setPauseBtnText] = useState(stopRecordStr)
  const [resultLogs, setResultLogs] = useState<Log[]>([])
  const [curLog, setCurLog] = useState<Log | undefined>()
  const [drawerHeight, setDrawerHeight] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const columnBase = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a: Log, b: Log) => a.id - b.id
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      width: 300,
      render: (item) => (
        <Tooltip placement="topLeft" title={item}>
          {item}
        </Tooltip>
      ),
      sorter: (a: Log, b: Log) => a.url.localeCompare(b.url)
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 80,
      sorter: (a: Log, b: Log) => a.protocol.localeCompare(b.protocol)
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      ellipsis: true,
      width: 100,
      sorter: (a: Log, b: Log) => a.host.localeCompare(b.host),
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
      width: 140,
      sorter: (a: Log, b: Log) => {
        return a.pathname?.localeCompare(b.pathname)
      },
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
      width: 90,
      sorter: (a: Log, b: Log) => a.method.localeCompare(b.method)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 60,
      sorter: (a: Log, b: Log) => a.status - b.status
    },
    {
      title: 'MatchRules',
      dataIndex: 'matchedRules',
      key: 'matchedRules',
      ellipsis: true,
      width: 140,
      render(_, record: Log) {
        return (
          <Space size="small">
            {record.matchedRules.map((ruleId) => {
              const rule = findGroupOrRule(apiRules, ruleId)
              return rule ? (
                <NavLink key={ruleId} to={`/rules/edit/${rule.id}`}>
                  {rule.name}
                </NavLink>
              ) : (
                ''
              )
            })}
          </Space>
        )
      }
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 80,
      sorter: (a: Log, b: Log) => {
        const aTime = a.finishTime ? a.finishTime - a.startTime : 0
        const bTime = b.finishTime ? b.finishTime - b.startTime : 0
        return aTime - bTime
      },
      render(_, record: Log) {
        return record.finishTime ? `${record.finishTime - record.startTime}ms` : ''
      }
    }
  ]

  const [columns, setColumns] = useState<ColumnType<any>[]>(columnBase)

  const columnsWithResizeHandlers = columns.map((col, index) => ({
    ...col,
    onHeaderCell: (column: ColumnType<any>) =>
      ({
        width: column.width,
        onResize: (e: any, { size }: { size: any }) => handleResize(index)(e, { size })
      }) as any
  }))

  const handleResize =
    (index) =>
    (e, { size }) => {
      setColumns((columns) => {
        const nextColumns = [...columns]
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width
        }
        return nextColumns
      })
    }

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

  const tableWidth = columns.reduce((acc, cur) => acc + (cur.width as number), 0)

  const components = {
    header: {
      cell: ResizableTitle
    }
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
        columns={columnsWithResizeHandlers}
        dataSource={resultLogs}
        pagination={false}
        scroll={{ x: tableWidth, y: tableHeight }}
        components={components}
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
