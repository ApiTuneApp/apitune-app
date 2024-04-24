import { RenderEvent } from '@shared/contract'
import { useRuleStore } from '@renderer/store'

export function getApiRules() {
  const initApiRules = useRuleStore.getState().initApiRules
  window.api.getApiRules().then((apiRules) => {
    initApiRules(apiRules)
  })
  return () => {
    window.api.clearupEvent(RenderEvent.GetApiRules)
  }
}
