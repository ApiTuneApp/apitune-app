import '@renderer/components/add-rule-item/index.less'
import './rules.less'

import { useParams, useSearchParams } from 'react-router-dom'

import RuleEditor from '@renderer/components/rule-editor'

function NewRulePage(): JSX.Element {
  const [searchParams] = useSearchParams()

  // groupId has value when add new rule to a group
  const groupId = searchParams.get('groupId')
  const targetTab = searchParams.get('tab') || 'rule'

  const { id: editRuleId } = useParams()

  return (
    <div className="page-new">
      <RuleEditor editRuleId={editRuleId} groupId={groupId} targetTab={targetTab} />
    </div>
  )
}

export default NewRulePage
