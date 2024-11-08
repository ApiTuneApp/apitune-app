import { Modal, Spin } from 'antd'
import { useEffect, useState } from 'react'

import { getShareRule } from '@renderer/services/db'
import { ShareRule } from '@shared/contract'

interface ShareModalProps {
  open: boolean
  shareId: string
  onCancel: () => void
}

export default function ShareViewModal({ open, shareId, onCancel }: ShareModalProps) {
  const [shareLoading, setShareLoading] = useState(false)
  const [shareData, setShareData] = useState<ShareRule | null>(null)

  useEffect(() => {
    if (open) {
      setShareLoading(true)
      getShareRule(shareId)
        .then(setShareData)
        .finally(() => setShareLoading(false))
    }
  }, [open])

  const handleImportRule = async () => {
    if (!shareData) return
    onCancel()
  }

  return (
    <Modal
      title="Shared Rule"
      open={open}
      onCancel={onCancel}
      onOk={handleImportRule}
      okText="Import Rule"
      confirmLoading={shareLoading}
    >
      {shareLoading ? (
        <Spin />
      ) : shareData ? (
        <div>
          <p>Shared by: {shareData.users?.full_name}</p>
          <p>Rule name: {shareData.rule_data?.name}</p>
        </div>
      ) : (
        <div>Failed to load share details</div>
      )}
    </Modal>
  )
}
