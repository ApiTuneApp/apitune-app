import { Button, Collapse, Divider, Empty, Flex, Popconfirm, Space, Tabs } from 'antd'
import { useEffectOnActive } from 'keepalive-for-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LogDetail from '@renderer/components/log-detail'
import TestResults from '@renderer/components/test-results'
import { Log, TestItem } from '@shared/contract'

type TestResultItem = {
  testResult: TestItem
  log: Log
}

export default function TestScriptsPage() {
  const [testResultList, setTestResultList] = useState<TestResultItem[]>([])
  const [activeKey, setActiveKey] = useState<string | string[]>()
  const navigate = useNavigate()

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

  const goCreateTest = () => {
    navigate('/rules/new?tab=tests')
  }

  const clearTestResult = () => {
    window.api.clearTestResult().then(() => {
      setTestResultList([])
    })
  }

  return (
    <Flex className="app-page" vertical>
      {testResultList.length > 0 && (
        <>
          <div>
            <Button type="primary" onClick={goCreateTest} style={{ marginRight: 10 }}>
              Add rule to create a test
            </Button>
            {/* <Popconfirm
              title="Are you sure to clear all test result?"
              description="Your will not be able to recover the result!"
              onConfirm={clearTestResult}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Clear all result</Button>
            </Popconfirm> */}
          </div>
          <Collapse
            items={items}
            activeKey={activeKey}
            onChange={onCollapseChange}
            style={{ marginTop: 10 }}
          />
        </>
      )}
      {testResultList.length === 0 && (
        <Empty>
          <Button type="primary" onClick={goCreateTest}>
            Add rule to create a test
          </Button>
        </Empty>
      )}
    </Flex>
  )
}
