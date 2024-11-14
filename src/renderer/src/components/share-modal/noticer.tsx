import { Button, notification, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SmileOutlined } from '@ant-design/icons'
import { getShareRule } from '@renderer/services/db'
import { strings } from '@renderer/services/localization'
import { useUserStore } from '@renderer/store/user'
import { MainEvent, RuleData, ShareRule } from '@shared/contract'

const { Paragraph, Title } = Typography

interface ShareModalProps {
  onCancel?: () => void
}

export default function ShareRuleNoticer({ onCancel }: ShareModalProps) {
  const [api, contextHolder] = notification.useNotification()
  const { user } = useUserStore()
  const navigate = useNavigate()

  const goViewDetail = (shareData: ShareRule) => {
    navigate(`/rules/share/${shareData.id}?type=view`, { state: { shareData } })
    api.destroy(shareData.id)
  }

  const openNotification = (shareData: ShareRule) => {
    const isGroup = shareData.rule_data?.kind === 'group'
    const isOwner = shareData.users?.id === user.id
    const message = isOwner
      ? strings.openMyShare
      : strings.formatString(
          strings.shareRuleWithYou,
          shareData.users?.full_name,
          isGroup ? strings.group : strings.rule.toLowerCase()
        )
    const btns = isOwner
      ? [
          <Button type="link" key="view-details" onClick={() => goViewDetail(shareData)}>
            {strings.viewDetails}
          </Button>
        ]
      : [
          <Button type="link" key="view-details" onClick={() => goViewDetail(shareData)}>
            {strings.viewDetails}
          </Button>,
          <Button type="primary" key="import-rule">
            {strings.importToMyShare}
          </Button>
        ]
    api.open({
      message,
      description: (
        <>
          <Title level={5}>{shareData.rule_data?.name}</Title>
          {(shareData.rule_data as RuleData).description && (
            <Paragraph>{(shareData.rule_data as RuleData).description}</Paragraph>
          )}
        </>
      ),
      key: shareData.id,
      btn: btns,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />
    })
  }

  useEffect(() => {
    window.api.onOpenShare((shareId) => {
      getShareRule(shareId).then((shareData) => {
        if (shareData) {
          openNotification(shareData)
        }
      })
    })
    return () => {
      window.api.clearupEvent(MainEvent.OpenShare)
    }
  }, [])

  return <>{contextHolder}</>
}
