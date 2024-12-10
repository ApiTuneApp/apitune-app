import { Input, Modal } from 'antd'
import * as React from 'react'

import * as Service from '@renderer/services'
import { strings } from '@renderer/services/localization'
import { useRuleStore } from '@renderer/store'
import { EventResultStatus, RenderEvent } from '@shared/contract'

type NameModalProps = {
  open: boolean
  groupId?: string | null
  onClose: () => void
  onSubmit?: () => void
}

export default function GroupEditModal(props: NameModalProps): JSX.Element {
  const { open, groupId, onClose, onSubmit } = props
  const apiRules = useRuleStore((state) => state.apiRules)
  const [newGroupInputError, setNewGroupInputError] = React.useState(false)
  const [name, setName] = React.useState('')

  React.useEffect(() => {
    setName(groupId ? apiRules.find((r) => r.id === groupId)!.name : '')
  }, [groupId, open])

  const handleNewGroupNameChange = (value: string) => {
    setName(value)
    setNewGroupInputError(!value)
  }

  const handelAddGroupSubmit = async () => {
    if (!name) {
      setNewGroupInputError(true)
      return
    }
    if (groupId) {
      const result = await window.api.updateRuleGroupName(groupId, name)
      if (result.status === EventResultStatus.Success) {
        Service.getApiRules(RenderEvent.UpdateRuleGroupName)
      }
    } else {
      const result = await window.api.addRule(
        JSON.stringify({
          kind: 'group',
          name: name,
          ruleList: [],
          enable: true
        })
      )
      if (result.status === EventResultStatus.Success) {
        Service.getApiRules(RenderEvent.AddRule)
      }
    }
    onSubmit && onSubmit()
    onClose()
  }

  return (
    <Modal
      centered
      destroyOnClose
      title={`${groupId ? strings.edit : strings.new} ${strings.ruleGroupName}`}
      open={open}
      onOk={handelAddGroupSubmit}
      onCancel={() => onClose()}
    >
      <Input
        status={newGroupInputError ? 'error' : ''}
        value={name}
        onChange={(e) => handleNewGroupNameChange(e.target.value)}
      />
    </Modal>
  )
}
