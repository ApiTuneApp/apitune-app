import './print.less'

import { Alert, Button, Card, ConfigProvider, Empty, Flex, Space, Typography } from 'antd'
import { BaseType } from 'antd/es/typography/Base'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LogLink from '@renderer/components/log-link'
import RuleLink from '@renderer/components/rule-link'
import { strings } from '@renderer/services/localization'
import { useUserStore } from '@renderer/store/user'
import { MAX_FREE_LOGS } from '@shared/constants'
import { MainEvent, PrintItem } from '@shared/contract'
import { checkSubscriptionActive } from '@shared/utils'

const { Text } = Typography

// Helper function to get text type based on log type
const getTextType = (type: string) => {
  switch (type) {
    case 'info':
      return 'success'
    case 'error':
      return 'danger'
    case 'warning':
      return 'warning'
    case 'debug':
      return 'secondary'
    default:
      return undefined
  }
}

export default function PrintsPage() {
  const navigate = useNavigate()
  const { subscription } = useUserStore()
  const [printItems, setPrintItems] = useState<PrintItem[]>([])

  useEffect(() => {
    window.api.onPrintLog((printItem) => {
      if (!checkSubscriptionActive(subscription)) {
        const totalPrintCount = printItems.reduce((acc, item) => acc + item.printList.length, 0)
        if (totalPrintCount + printItem.printList.length >= MAX_FREE_LOGS) {
          if (totalPrintCount < MAX_FREE_LOGS) {
            setPrintItems((prev) => {
              return [
                ...prev,
                {
                  ...printItem,
                  printList: printItem.printList.slice(0, MAX_FREE_LOGS - totalPrintCount)
                }
              ]
            })
          }
        } else {
          setPrintItems((prev) => [...prev, printItem])
        }
      } else {
        setPrintItems((prev) => [...prev, printItem])
      }
    })
    return () => {
      window.api.clearupEvent(MainEvent.PrintLog)
    }
  }, [printItems, subscription])

  useEffect(() => {
    window.api.getPrintLogs().then((pItems) => {
      const newItems = [] as PrintItem[]
      if (!checkSubscriptionActive(subscription)) {
        let printCount = 0
        pItems.forEach((item) => {
          if (printCount < MAX_FREE_LOGS) {
            if (item.printList.length >= MAX_FREE_LOGS) {
              printCount = MAX_FREE_LOGS
              newItems.push({ ...item, printList: item.printList.slice(0, MAX_FREE_LOGS) })
            } else {
              printCount += item.printList.length
              newItems.push(item)
            }
          }
        })
      }
      setPrintItems(newItems)
    })
    return () => {
      window.api.clearupEvent(MainEvent.PrintLog)
    }
  }, [subscription])

  const goCreatePrint = () => {
    navigate('/rules/new?tab=tests')
  }
  const clearPrints = () => {
    window.api.clearPrintLogs()
    setPrintItems([])
  }
  return (
    <Flex className="app-page" vertical gap={4}>
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
      {printItems.map((printItem) => {
        return printItem.printList.map((printScript, index) => (
          <div key={printItem.logId + '_' + index} className="print-line">
            {printScript.type && (
              <Text className="print-line-type" type={getTextType(printScript.type) as BaseType}>
                [{printScript.type.toUpperCase()}]
              </Text>
            )}
            <Text className="print-line-text">{printScript.printStr}</Text>
            <Space className="print-meta">
              <Text type="secondary" className="print-meta-item">
                {strings.rule}: <RuleLink id={printItem.ruleId} tab="tests" />
              </Text>
              <Text type="secondary" className="print-meta-item">
                {strings.logId}: <LogLink id={printItem.logId} />
              </Text>
            </Space>
          </div>
        ))
      })}
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
