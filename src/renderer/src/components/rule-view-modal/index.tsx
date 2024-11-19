import { Modal } from 'antd'

import RuleEditor from '@renderer/components/rule-editor'
import { RuleData } from '@shared/contract'

interface RuleViewModalProps {
  ruleData?: RuleData
  open: boolean
  onClose?: () => void
}

export default function RuleViewModal({ ruleData, open, onClose }: RuleViewModalProps) {
  return (
    <Modal width="80%" footer={null} title={ruleData?.name} open={open} onCancel={onClose}>
      <RuleEditor ruleData={ruleData} disabled />
    </Modal>
  )
}
