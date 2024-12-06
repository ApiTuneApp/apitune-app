import '@renderer/components/add-rule-item/index.less'
import './rules.less'

import { useLocation, useParams, useSearchParams } from 'react-router-dom'

import RuleEditor from '@renderer/components/rule-editor'

function NewRulePage(): JSX.Element {
  const [searchParams] = useSearchParams()
  const location = useLocation()

  // groupId has value when add new rule to a group
  const groupId = searchParams.get('groupId')
  const targetTab = searchParams.get('tab') || 'rule'

  const { id } = useParams()
  // Set editRuleId to null if path is 'rules/new'
  const editRuleId = location.pathname === '/rules/new' ? undefined : id

  return (
    <div className="page-new">
      <RuleEditor editRuleId={editRuleId} groupId={groupId} targetTab={targetTab} />
    </div>
  )
}

export default NewRulePage
