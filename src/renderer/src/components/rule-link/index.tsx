import { NavLink } from 'react-router-dom'
import { useRuleStore } from '@renderer/store'
import { findGroupOrRule } from '@shared/utils'

interface RuleLinkProps {
  id: string
  name?: string
  tab?: 'rules' | 'tests'
}
export default function RuleLink({ id, name, tab }: RuleLinkProps): JSX.Element {
  const apiRules = useRuleStore((state) => state.apiRules)
  const rule = findGroupOrRule(apiRules, id)
  if (tab) {
    return <NavLink to={`/rules/edit/${rule?.id}?tab=${tab}`}>{name || rule?.name}</NavLink>
  }

  return <NavLink to={`/rules/edit/${rule?.id}`}>{name || rule?.name}</NavLink>
}
