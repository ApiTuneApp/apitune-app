import { NavLink } from 'react-router-dom'
import { useRuleStore } from '@renderer/store'
import { findGroupOrRule } from '@shared/utils'

interface RuleLinkProps {
  id: string
  tab?: 'rules' | 'tests'
}
export default function RuleLink({ id, tab }: RuleLinkProps): JSX.Element {
  const apiRules = useRuleStore((state) => state.apiRules)
  const rule = findGroupOrRule(apiRules, id)
  if (tab) {
    return <NavLink to={`/rules/edit/${rule?.id}?tab=${tab}`}>{rule?.name}</NavLink>
  }

  return <NavLink to={`/rules/edit/${rule?.id}`}>{rule?.name}</NavLink>
}
