import { NavLink } from 'react-router-dom'
import { useRuleStore } from '@renderer/store'
import { findGroupOrRule } from '@shared/utils'

interface RuleLinkProps {
  id: string
}
export default function RuleLink({ id }: RuleLinkProps): JSX.Element {
  const apiRules = useRuleStore((state) => state.apiRules)
  const rule = findGroupOrRule(apiRules, id)

  return <NavLink to={`/rules/edit/${rule?.id}`}>{rule?.name}</NavLink>
}
