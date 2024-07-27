import { Log, TestItem } from '@shared/contract'
import { Flex, Collapse, Space, Divider, Button, Tabs } from 'antd'
import { useState } from 'react'
import { useEffectOnActive } from 'keepalive-for-react'
import TestResults from '@renderer/components/test-results'
import LogDetail from '@renderer/components/log-detail'

type TestResultItem = {
  testResult: TestItem
  log: Log
}

export default function TestScriptsPage() {
  const [testResultList, setTestResultList] = useState<TestResultItem[]>([])
  const [activeKey, setActiveKey] = useState<string | string[]>()

  useEffectOnActive(
    () => {
      window.api.getAllTestResults().then((result) => {
        if (result) {
          window.api.getProxyLogs().then((logs) => {
            const testResultList = Object.keys(result).map((logId) => {
              const log = logs.find((log) => log.id === Number(logId))
              return {
                log,
                testResult: result[logId]
              } as TestResultItem
            })
            setTestResultList(testResultList)
            setActiveKey(testResultList.slice(0, 3).map((item) => item.log.id.toString()))
          })
        } else {
          setTestResultList([])
        }
      })
    },
    false,
    []
  )

  function getTestResultInfo(testResult: TestItem) {
    const allCaseCount = testResult.tests.reduce((acc, test) => acc + test.cases.length, 0)
    const failedCaseCount = testResult.tests.reduce((acc, test) => {
      return acc + test.cases.filter((item) => item.error).length
    }, 0)
    const passedCaseCount = allCaseCount - failedCaseCount
    return {
      all: allCaseCount,
      failed: failedCaseCount,
      passed: passedCaseCount
    }
  }

  const genExtra = (item) => {
    const { all, failed, passed } = getTestResultInfo(item.testResult)
    return (
      <Space>
        <span>LogId: {item.log.id}</span>
        <Divider type="vertical" style={{ borderColor: 'var(--color-text-2)' }} />
        <span>All: {all}</span>
        <Divider type="vertical" style={{ borderColor: 'var(--color-text-2)' }} />
        <span>Passed: {passed}</span>
        <Divider type="vertical" style={{ borderColor: 'var(--color-text-2)' }} />
        <span>Failed: {failed}</span>
      </Space>
    )
  }

  const items = testResultList.map((item) => ({
    key: item.log.id,
    label: item.log.url,
    children: (
      <Tabs
        tabPosition="right"
        items={[
          {
            key: 'test-results',
            label: 'Test Results',
            children: <TestResults logId={item.log.id} />
          },
          {
            key: 'log',
            label: 'Request Details',
            children: <LogDetail log={item.log} hideTestResult={true} />
          }
        ]}
      />
    ),
    extra: genExtra(item)
  }))

  const onCollapseChange = (key: string | string[]) => {
    setActiveKey(key)
  }

  return (
    <Flex className="app-page" vertical>
      <Collapse items={items} activeKey={activeKey} onChange={onCollapseChange} />
    </Flex>
  )
}
