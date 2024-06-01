import { RenderEvent } from '@shared/contract'
import { useRuleStore } from '@renderer/store'
import { useSettingStore } from '@renderer/store/setting'

export function getApiRules() {
  const initApiRules = useRuleStore.getState().initApiRules
  window.api.getApiRules().then((apiRules) => {
    initApiRules(apiRules)
  })
  return () => {
    window.api.clearupEvent(RenderEvent.GetApiRules)
  }
}

export function getSettings() {
  const initSettings = useSettingStore.getState().initSettings
  window.api.getSettings().then((settings) => {
    initSettings(settings)
  })
  return () => {
    window.api.clearupEvent(RenderEvent.GetSettings)
  }
}
