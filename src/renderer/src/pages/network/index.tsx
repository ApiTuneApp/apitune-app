import './network.less'
import 'react-resizable/css/styles.css'

import {
  Button,
  Divider,
  Dropdown,
  Flex,
  Input,
  Radio,
  RadioChangeEvent,
  Space,
  Table,
  Tooltip,
  Checkbox,
  MenuProps
} from 'antd'
import { ColumnType } from 'antd/es/table'
import { useEffectOnActive } from 'keepalive-for-react'
import { useCallback, useEffect, useState } from 'react'
import { Resizable } from 'react-resizable'
import { NavLink } from 'react-router-dom'

import {
  ApiOutlined,
  ClearOutlined,
  CloseOutlined,
  FilterOutlined,
  HolderOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ControlOutlined
} from '@ant-design/icons'
import LogDetail from '@renderer/components/log-detail'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { useUxStore } from '@renderer/store/ux'
import { Log } from '@shared/contract'
import { findGroupOrRule } from '@shared/utils'
import { useSettingStore } from '@renderer/store/setting'
import { CheckboxChangeEvent } from 'antd/es/checkbox'

const AppHeaderHeight = 40
const NetworkPagePadding = 40
const MinDrawerHeight = 20
const MaxDarwerHeight = 1000

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
  const { language } = useSettingStore((state) => state)

  const apiRules = useRuleStore((state) => state.apiRules)

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
      title: strings.protocol,
      dataIndex: 'protocol',
      key: 'protocol',
      width: 80,
      sorter: (a: Log, b: Log) => a.protocol.localeCompare(b.protocol)
    },
    {
      title: strings.host,
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
      title: strings.path,
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
      title: strings.method,
      dataIndex: 'method',
      key: 'method',
      width: 90,
      sorter: (a: Log, b: Log) => a.method.localeCompare(b.method)
    },
    {
      title: strings.status,
      dataIndex: 'status',
      key: 'status',
      width: 60,
      sorter: (a: Log, b: Log) => (a.status && b.status ? a.status - b.status : 0),
      render(status: number) {
        if (!status) return ''
        let color = ''
        if (status < 200)
          color = '#1677ff' // Info blue
        else if (status < 300)
          color = '#52c41a' // Success green
        else if (status < 400)
          color = '#faad14' // Warning yellow
        else if (status < 500)
          color = '#ff4d4f' // Error red
        else color = '#cf1322' // Dark red
        return <span style={{ color }}>{status}</span>
      }
    },
    {
      title: strings.matchedRules,
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

  const stopRecordStr = strings.pause
  const startRecordStr = strings.resume
  const [pauseBtnText, setPauseBtnText] = useState(stopRecordStr)
  const [showFilter, setShowFilter] = useState(false)
  const [resultLogs, setResultLogs] = useState<Log[]>([])
  const [curLog, setCurLog] = useState<Log | undefined>()
  const [drawerHeight, setDrawerHeight] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [logType, setLogType] = useState('all')
  const [logStatus, setLogStatus] = useState('all')
  const [showRuleMatched, setShowRuleMatched] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnBase.map((col) => col.key as string)
  )

  useEffectOnActive(
    () => {
      const target = document.getElementsByClassName(
        'ant-table-tbody-virtual-holder-inner'
      )[0] as HTMLElement
      if (target) {
        /**
         * When table set virtual to true, the table will show blank after swithing from sidebar.
         * The issue seems to be caused by the virtual table set reset transform style
         */
        target.style.transform = 'none'
      }
    },
    true,
    []
  )

  const additionalColumns = [
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
      sorter: (a: Log, b: Log) => a.startTime - b.startTime
    },
    {
      title: 'Finish Time',
      dataIndex: 'finishTime',
      key: 'finishTime',
      width: 160,
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
      sorter: (a: Log, b: Log) => (a.finishTime && b.finishTime ? a.finishTime - b.finishTime : 0)
    },
    {
      title: 'Response Type',
      dataIndex: 'responseType',
      key: 'responseType',
      width: 120,
      render: (_, record: Log) => record.responseHeaders['content-type'] || '',
      sorter: (a: Log, b: Log) => {
        const aType = a.responseHeaders['content-type'] || ''
        const bType = b.responseHeaders['content-type'] || ''
        return aType.localeCompare(bType)
      }
    },
    {
      title: 'Remote IP',
      dataIndex: 'remoteIp',
      key: 'remoteIp',
      width: 120
    },
    {
      title: 'Remote Port',
      dataIndex: 'remotePort',
      key: 'remotePort',
      width: 100
    }
  ]

  const allColumns = [...columnBase, ...additionalColumns]

  const columnItems: MenuProps['items'] = allColumns.map((col) => ({
    key: col.key,
    label: (
      <Checkbox
        checked={selectedColumns.includes(col.key as string)}
        onChange={(e) => handleColumnChange(e, col.key as string)}
      >
        {col.title}
      </Checkbox>
    )
  }))

  useEffect(() => {
    const filteredColumns = allColumns.filter((col) => selectedColumns.includes(col.key as string))
    setColumns(filteredColumns)
    setPauseBtnText(recordPaused ? startRecordStr : stopRecordStr)
  }, [language, selectedColumns])

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

  const handlePauseClick = function () {
    setPauseBtnText(!recordPaused ? startRecordStr : stopRecordStr)
    setRecordPaused(!recordPaused)
  }

  const handleShowFilter = function () {
    setShowFilter(!showFilter)
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
  }

  const handleLogTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setLogType(value)
  }

  const handleLogStatusChange = ({ target: { value } }: RadioChangeEvent) => {
    setLogStatus(value)
  }

  const filterLogUrl = (logs: Log[], searchValue: string): Log[] => {
    if (searchValue) {
      return proxyLogs.filter((log) => log.url.includes(searchValue))
    } else {
      return logs
    }
  }
  const filterLogType = (logs: Log[], logType: string): Log[] => {
    switch (logType) {
      case 'all':
        return logs
      case 'fetch':
        return logs.filter((log) => {
          const resType = log.responseHeaders['content-type']
          return resType && (resType.includes('json') || resType.includes('text'))
        })
      case 'doc':
        return logs.filter((log) => {
          const resType = log.responseHeaders['content-type']
          return resType && resType.includes('html')
        })
      case 'css':
        return logs.filter((log) => {
          const resType = log.responseHeaders['content-type']
          return resType && resType.includes('css')
        })
      case 'js':
        return logs.filter((log) => {
          const resType = log.responseHeaders['content-type']
          return resType && resType.includes('javascript')
        })
      case 'font':
        return logs.filter((log) => {
          const resType = log.responseHeaders['content-type']
          return resType && resType.includes('font')
        })
      case 'img':
        return logs.filter((log) => {
          const resType = log.responseHeaders['content-type']
          return resType && resType.includes('image')
        })
      default:
        return logs
    }
  }

  const fitlerLogStatus = (logs: Log[], logStatus: string): Log[] => {
    switch (logStatus) {
      case 'all':
        return logs
      case '1xx':
        return logs.filter((log) => log.status && log.status < 200)
      case '2xx':
        return logs.filter((log) => log.status && log.status >= 200 && log.status < 300)
      case '3xx':
        return logs.filter((log) => log.status && log.status >= 300 && log.status < 400)
      case '4xx':
        return logs.filter((log) => log.status && log.status >= 400 && log.status < 500)
      case '5xx':
        return logs.filter((log) => log.status && log.status >= 500)
      default:
        return logs
    }
  }

  const filterRuleMatched = (logs: Log[], showRuleMatched: boolean): Log[] => {
    if (showRuleMatched) {
      return logs.filter((log) => log.matchedRules.length > 0)
    } else {
      return logs
    }
  }

  useEffect(() => {
    const r0 = filterRuleMatched(proxyLogs, showRuleMatched)
    const r1 = filterLogUrl(r0, searchValue)
    const r2 = filterLogType(r1, logType)
    const r3 = fitlerLogStatus(r2, logStatus)
    setResultLogs(r3)
  }, [showRuleMatched, searchValue, logType, logStatus, proxyLogs])

  const handleRowClick = (record: Log) => {
    console.log('cur log', record)
    setCurLog(record)
    if (!drawerHeight) {
      setDrawerHeight(400)
    }
  }

  const tableHeight =
    document.body.offsetHeight - drawerHeight - AppHeaderHeight - NetworkPagePadding - 50

  const tableWidth = columns.reduce((acc, cur) => acc + (cur.width as number), 0)

  const components = {
    header: {
      cell: ResizableTitle
    }
  }

  const handleColumnChange = (e: CheckboxChangeEvent, columnKey: string) => {
    const { checked } = e.target
    setSelectedColumns((prev) => {
      if (checked) {
        return [...prev, columnKey]
      }
      return prev.filter((key) => key !== columnKey)
    })
  }

  return (
    <Flex className="app-page page-network" vertical>
      <Space style={{ paddingBottom: '10px' }}>
        <Input
          allowClear
          placeholder="Search URL"
          className="app-control app-input network-input"
          value={searchValue}
          onChange={handleSearchChange}
        />
        <Button icon={<ClearOutlined />} onClick={handleClearLog}>
          {strings.clearLog}
        </Button>
        <Button
          icon={recordPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
          onClick={handlePauseClick}
        >
          {pauseBtnText}
        </Button>
        <Button icon={<FilterOutlined />} onClick={handleShowFilter}>
          {strings.filter}
        </Button>
        <Button
          icon={<ApiOutlined />}
          danger={showRuleMatched}
          onClick={() => setShowRuleMatched(!showRuleMatched)}
        >
          {strings.ruleMatched}
        </Button>
        <Dropdown menu={{ items: columnItems }} trigger={['click']}>
          <Button icon={<ControlOutlined />}>{strings.columns}</Button>
        </Dropdown>
      </Space>
      {showFilter && (
        <Space style={{ paddingBottom: '10px' }}>
          <Radio.Group defaultValue="all" onChange={handleLogTypeChange}>
            <Radio.Button value="all">{strings.all}</Radio.Button>
            <Radio.Button value="fetch">Fetch/XHR</Radio.Button>
            <Radio.Button value="doc">Doc</Radio.Button>
            <Radio.Button value="css">CSS</Radio.Button>
            <Radio.Button value="js">JS</Radio.Button>
            <Radio.Button value="font">font</Radio.Button>
            <Radio.Button value="img">Img</Radio.Button>
          </Radio.Group>
          <Divider type="vertical" style={{ borderColor: 'var(--color-text-3)' }} />
          <Radio.Group defaultValue="all" onChange={handleLogStatusChange}>
            <Radio.Button value="all">{strings.all}</Radio.Button>
            <Radio.Button value="1xx">1xx</Radio.Button>
            <Radio.Button value="2xx">2xx</Radio.Button>
            <Radio.Button value="3xx">3xx</Radio.Button>
            <Radio.Button value="4xx">4xx</Radio.Button>
            <Radio.Button value="5xx">5xx</Radio.Button>
          </Radio.Group>
        </Space>
      )}
      <Table
        className="network-table"
        size="small"
        rowKey="id"
        virtual={true}
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
        <div className="network-detail">
          {curLog && <LogDetail log={curLog} height={drawerHeight} />}
        </div>
      </div>
    </Flex>
  )
}

export default NetworkPage
