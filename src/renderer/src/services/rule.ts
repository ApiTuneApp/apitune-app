import { RenderEvent } from '@shared/contract'
import { useStore } from '@renderer/store'

export function getApiRules() {
  const initApiRules = useStore.getState().initApiRules
  window.api.getApiRules().then((apiRules) => {
    initApiRules(apiRules)
  })
  return () => {
    window.api.clearupEvent(RenderEvent.GetApiRules)
  }
}
