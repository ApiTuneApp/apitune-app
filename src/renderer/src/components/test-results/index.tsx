import { Descriptions, List, Space, Tag } from 'antd'
import { useEffect, useState } from 'react'
import RuleLink from '@renderer/components/rule-link'
import { TestItem } from '@shared/contract'

interface TestResultsProps {
  logId: number
}

export default function TestResults({ logId }: TestResultsProps): JSX.Element {
  const [testResults, setTestResults] = useState<TestItem>({} as TestItem)
  useEffect(() => {
    if (logId) {
      window.api.getTestResults(logId).then((result) => {
        if (result) {
          setTestResults(result)
        } else {
          setTestResults({} as TestItem)
        }
      })
    }
  }, [logId])
  return (
    <div>
      {testResults.startTime && (
        <>
          <Descriptions>
            <Descriptions.Item label="Start time:" span={1}>
              {new Date(testResults.startTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="End time:" span={1}>
              {new Date(testResults.endTime).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
          {testResults.tests.map((test, index) => (
            <List
              key={test.ruleId}
              header={
                <div style={{ fontWeight: 600 }}>
                  Rule: <RuleLink id={test.ruleId} tab="tests" />
                </div>
              }
              dataSource={test.cases}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <span style={{ width: '120px', display: 'inline-block' }}>
                      <Tag color={item.error ? 'error' : 'success'}>
                        {item.error ? 'Failed' : 'Passed'}
                      </Tag>
                    </span>
                    <span>
                      {item.title} {item.error && `: ${item.error}`}
                    </span>
                  </Space>
                </List.Item>
              )}
            />
          ))}
        </>
      )}
    </div>
  )
}
