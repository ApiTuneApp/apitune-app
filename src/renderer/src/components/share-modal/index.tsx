import { Button, Input, Modal, Space } from 'antd'

import { CopyOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { strings } from '@renderer/services/localization'

interface ShareModalProps {
  open: boolean
  ruleOrGroupId: string | null
  onCancel: () => void
}

export default function ShareModal({ open, onCancel }: ShareModalProps) {
  return (
    <Modal
      style={{ top: '25%' }}
      open={open}
      width={'40%'}
      title={strings.shareRule}
      onCancel={onCancel}
      okText={strings.close}
      footer={null}
    >
      <Space.Compact style={{ width: '100%', marginBottom: '8px' }}>
        <Input />
        <Button type="primary" icon={<CopyOutlined />}>
          {strings.copyLink}
        </Button>
      </Space.Compact>
      <Space size={6}>
        <InfoCircleOutlined />
        <div>{strings.shareDesc}</div>
      </Space>
    </Modal>
  )
}
