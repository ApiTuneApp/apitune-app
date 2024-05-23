import { Modal, Flex, Select, Input, Alert } from 'antd'
import { useEffect, useState } from 'react'

interface MatchTestModalProps {
  open: boolean
  initValue?: {
    matchType: string
    matchOperator: string
    matchValue: string
  }
  onCancel: () => void
}

export default function MatchTestModal({ open, initValue, onCancel }: MatchTestModalProps) {
  const [matchType, setMatchType] = useState('url')
  const [matchOperator, setMatchOperator] = useState('contains')
  const [matchValue, setMatchValue] = useState('')
  const [testUrl, setTestUrl] = useState('')
  const [testResult, setTestResult] = useState(false)

  const testMatch = () => {
    if (testUrl && matchValue) {
      const reg = new RegExp(matchValue)
      let matchResult = false
      switch (matchOperator) {
        case 'contains':
          matchResult = testUrl.includes(matchValue)
          break
        case 'equals':
          matchResult = testUrl === matchValue
          break
        case 'matches':
          matchResult = reg.test(testUrl)
          break
      }
      setTestResult(matchResult)
    }
  }

  useEffect(() => {
    if (initValue) {
      setMatchType(initValue.matchType)
      setMatchOperator(initValue.matchOperator)
      setMatchValue(initValue.matchValue)
    }
  }, [initValue])

  useEffect(() => {
    testMatch()
  }, [testUrl, matchType, matchValue, matchOperator])

  return (
    <Modal
      style={{ top: '25%' }}
      open={open}
      width={'50%'}
      title="Test Match Rules"
      onCancel={onCancel}
      onOk={onCancel}
      okText="Close"
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <OkBtn />
        </>
      )}
    >
      <Flex gap={4} style={{ marginBottom: '8px' }} align="baseline">
        <Select
          value={matchType}
          onChange={setMatchType}
          options={[
            { label: 'URL', value: 'url' },
            { label: 'Host', value: 'host' },
            { label: 'Path', value: 'path' }
          ]}
        />
        <Select
          value={matchOperator}
          onChange={setMatchOperator}
          options={[
            { label: 'Contains', value: 'contains' },
            { label: 'Equals', value: 'equals' },
            { label: 'Matches(Regex)', value: 'matches' }
          ]}
        />
        <Input
          placeholder="Match Value"
          value={matchValue}
          onChange={(e) => setMatchValue(e.target.value)}
        />
      </Flex>
      <Input
        placeholder="Input the test url here"
        style={{ margin: '10px 0' }}
        value={testUrl}
        onChange={(e) => setTestUrl(e.target.value)}
      />
      {testUrl && (
        <>
          {testResult ? (
            <Alert message="Url Matched" type="success" showIcon />
          ) : (
            <Alert message="Url Not Matched" type="error" showIcon />
          )}
        </>
      )}
    </Modal>
  )
}
