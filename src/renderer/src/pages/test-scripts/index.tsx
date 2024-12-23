import {
  Alert,
  Button,
  Collapse,
  ConfigProvider,
  Divider,
  Empty,
  Flex,
  Popconfirm,
  Space,
  Tabs
} from 'antd'
import { useEffectOnActive } from 'keepalive-for-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LogDetail from '@renderer/components/log-detail'
import TestResults from '@renderer/components/test-results'
import { strings } from '@renderer/services/localization'
import { useUserStore } from '@renderer/store/user'
import { MAX_FREE_TESTS } from '@shared/constants'
import { Log, MainEvent, TestItem } from '@shared/contract'
import { checkSubscriptionActive } from '@shared/utils'

type TestResultItem = {
  testResult: TestItem
  log: Log
}

export default function TestScriptsPage() {
  const [testResultList, setTestResultList] = useState<TestResultItem[]>([])
  const [activeKey, setActiveKey] = useState<string | string[]>()
  const { subscription } = useUserStore()
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

  useEffect(() => {
    window.api.onTestResult((testResult) => {
      window.api.getProxyLogs().then((logs) => {
        const log = logs.find((log) => log.id === Number(testResult.logId))
        if (log) {
          const testResultItem = {
            testResult: testResult,
            log: log
          }
          setTestResultList((prev) => [...prev, testResultItem])
          if (!activeKey) {
            setActiveKey(testResultItem.log.id.toString())
          }
        }
      })
    })
    return () => {
      window.api.clearupEvent(MainEvent.TestResult)
    }
  }, [])

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
        <span>
          {strings.logId}: {item.log.id}
        </span>
        <Divider type="vertical" style={{ borderColor: 'var(--color-text-2)' }} />
        <span>
          {strings.testAll}: {all}
        </span>
        <Divider type="vertical" style={{ borderColor: 'var(--color-text-2)' }} />
        <span>
          {strings.testPassed}: {passed}
        </span>
        <Divider type="vertical" style={{ borderColor: 'var(--color-text-2)' }} />
        <span>
          {strings.testFailed}: {failed}
        </span>
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
            label: strings.testResults,
            children: <TestResults logId={item.log.id} />
          },
          {
            key: 'log',
            label: strings.reqDetails,
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
      {!checkSubscriptionActive(subscription) && (
        <ConfigProvider
          theme={{
            components: {
              Alert: {
                defaultPadding: '4px 8px',
                withDescriptionIconSize: 16,
                withDescriptionPadding: '10px 12px'
              }
            }
          }}
        >
          <Alert
            closable
            banner
            message={strings.subscriptionRequired}
            description={strings.formatString(strings.subscriptionRequiredDescTest, MAX_FREE_TESTS)}
            action={
              <Button
                type="primary"
                onClick={() => navigate('/subscription')}
                style={{ marginRight: 10 }}
              >
                {strings.upgradeToPro}
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        </ConfigProvider>
      )}
      {testResultList.length > 0 && (
        <>
          <div>
            <Button type="primary" onClick={goCreateTest} style={{ marginRight: 10 }}>
              {strings.addRuleToCreateTest}
            </Button>
            <Popconfirm
              title={strings.formatString(strings.deleteTitle, strings.testResults)}
              description={strings.formatString(strings.deleteDesc, strings.testResults)}
              onConfirm={clearTestResult}
              okText={strings.yes}
              cancelText={strings.no}
            >
              <Button danger>{strings.clearLog}</Button>
            </Popconfirm>
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
            {strings.addRuleToCreateTest}
          </Button>
        </Empty>
      )}
    </Flex>
  )
}
