import { RenderEvent } from '@shared/contract'
import { useRuleStore } from '@renderer/store'
import { useSettingStore } from '@renderer/store/setting'

import { strings } from './localization'

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
  const setAppThme = useSettingStore.getState().setAppTheme
  window.api.getSettings().then((settings) => {
    initSettings(settings)
    if (settings.theme === 'system') {
      window.api.getAppTheme().then((theme) => {
        setAppThme(theme)
      })
    } else {
      setAppThme(settings.theme)
    }
    strings.setLanguage(settings.language)
  })
  return () => {
    window.api.clearupEvent(RenderEvent.GetSettings)
  }
}
