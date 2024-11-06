import { Button, Input, Modal, Space, Tooltip } from 'antd'
import { useEffect, useState } from 'react'

import {
  CheckCircleOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { generateShareLink } from '@renderer/services/db'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { findGroupOrRule } from '@shared/utils'
import { useUserStore } from '@renderer/store/user'

const APP_SITE_URL = import.meta.env.VITE_SITE_URL

interface ShareModalProps {
  open: boolean
  ruleOrGroupId: string | null
  onCancel: () => void
}

export default function ShareModal({ open, ruleOrGroupId, onCancel }: ShareModalProps) {
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const apiRules = useRuleStore((state) => state.apiRules)
  const { user, isSignedIn } = useUserStore.getState()
  const isLogin = isSignedIn()

  useEffect(() => {
    if (open && ruleOrGroupId) {
      if (isLogin) {
        const ruleData = findGroupOrRule(apiRules, ruleOrGroupId)
        if (ruleData) {
          generateShareLink(user.id, ruleData)
            .then((data) => {
              if (data) {
                setLink(`${APP_SITE_URL}/share/${data}`)
                setLoading(false)
              }
            })
            .catch((error) => {
              console.error(error)
            })
        }
      }
    }
  }, [open, ruleOrGroupId])

  const handleCancel = () => {
    setLink('')
    setLoading(true)
    onCancel()
  }

  const handleSignIn = async () => {
    window.api.openSignInPage()
    handleCancel()
  }

  const handleCopyLink = () => {
    window.api.copyText(link)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 3000)
  }

  return (
    <Modal
      style={{ top: '25%' }}
      open={open}
      width={600}
      title={strings.shareRule}
      onCancel={handleCancel}
      okText={strings.close}
      footer={null}
    >
      {!isLogin && (
        <Space>
          <InfoCircleOutlined /> {strings.pleaseLoginFirst}
          <Button type="primary" onClick={handleSignIn} size="small">
            {strings.signIn}
          </Button>
        </Space>
      )}
      {isLogin && (
        <>
          {loading && (
            <Space>
              <LoadingOutlined /> {strings.generatingLink}
            </Space>
          )}
          {!loading && (
            <Space.Compact style={{ width: '100%', marginBottom: '8px' }}>
              <Input value={link} />
              <Tooltip title={isCopied ? strings.copied : strings.copyLink}>
                <Button
                  type="primary"
                  icon={isCopied ? <CheckCircleOutlined /> : <CopyOutlined />}
                  onClick={handleCopyLink}
                >
                  {strings.copyLink}
                </Button>
              </Tooltip>
            </Space.Compact>
          )}
          <Space size={6}>
            <InfoCircleOutlined />
            <div>{strings.shareDesc}</div>
          </Space>
        </>
      )}
    </Modal>
  )
}
