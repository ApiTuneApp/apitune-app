import './print.less'

import { Alert, Button, Card, ConfigProvider, Empty, Flex, Space } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RuleLink from '@renderer/components/rule-link'
import { strings } from '@renderer/services/localization'
import { useUserStore } from '@renderer/store/user'
import { MainEvent, PrintItem } from '@shared/contract'
import { MAX_FREE_LOGS } from '@shared/constants'
import { checkSubscriptionActive } from '@shared/utils'

export default function PrintsPage() {
  const navigate = useNavigate()
  const { subscription } = useUserStore()
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
            description={strings.formatString(strings.subscriptionRequiredDescLog, MAX_FREE_LOGS)}
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
        <div key={printItem.logId}>
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
        </div>
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
