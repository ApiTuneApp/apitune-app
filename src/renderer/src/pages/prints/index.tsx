import { Button, Card, Empty, Flex, Space } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RuleLink from '@renderer/components/rule-link'
import { strings } from '@renderer/services/localization'
import { MainEvent, PrintItem } from '@shared/contract'

import './print.less'

export default function PrintsPage() {
  const navigate = useNavigate()

  const [printItems, setPrintItems] = useState<PrintItem[]>([])
  useEffect(() => {
    window.api.onPrintLog((printItem) => {
      setPrintItems((prev) => [...prev, printItem])
    })
    return () => {
      window.api.clearupEvent(MainEvent.PrintLog)
    }
  }, [])

  useEffect(() => {
    window.api.getPrintLogs().then((printItems) => {
      setPrintItems(printItems)
    })
    return () => {
      window.api.clearupEvent(MainEvent.PrintLog)
    }
  }, [])

  const goCreatePrint = () => {
    navigate('/rules/new?tab=tests')
  }
  const clearPrints = () => {
    window.api.clearPrintLogs()
    setPrintItems([])
  }
  return (
    <Flex className="app-page" vertical gap={14}>
      {printItems.length > 0 && (
        <Space>
          <Button type="primary" onClick={goCreatePrint}>
            {strings.addRuleToCreatePrint}
          </Button>
          <Button danger onClick={clearPrints}>
            {strings.cleanPrints}
          </Button>
        </Space>
      )}
      {printItems.map((printItem) => (
        <>
          {printItem.printList.map((printScript, index) => (
            <Card
              size="small"
              key={printItem.logId + '_' + index}
              title={printScript.options.title}
              className="print-card"
            >
              <div style={printScript.options.styles}>{printScript.printStr}</div>
              <div className="print-card-actions">
                <div>
                  {strings.rule}: <RuleLink id={printItem.ruleId} tab="tests" />
                </div>
              </div>
            </Card>
          ))}
        </>
      ))}
      {printItems.length === 0 && (
        <Empty>
          <Button type="primary" onClick={goCreatePrint}>
            {strings.addRuleToCreatePrint}
          </Button>
        </Empty>
      )}
    </Flex>
  )
}
