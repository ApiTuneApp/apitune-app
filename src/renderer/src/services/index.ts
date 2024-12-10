import { RenderEvent, UndoRedoActionType, validUndoRedoActionTypes } from '@shared/contract'
import { useRuleStore } from '@renderer/store'
import { useSettingStore } from '@renderer/store/setting'
import * as jsonPatch from 'fast-json-patch'

import { strings } from './localization'

// Used to sync local storage rule to state memory
export function getApiRules(actionType?: UndoRedoActionType) {
  const { apiRules, initApiRules } = useRuleStore.getState()

  window.api.getRuleStorage().then((ruleStorage) => {
    if (actionType && validUndoRedoActionTypes.includes(actionType)) {
      try {
        const patches = jsonPatch.compare(ruleStorage.apiRules || [], apiRules)
        if (patches.length > 0) {
          // push patches to undo stack
          const undoStack = useRuleStore.getState().undoRedoStack.undo
          undoStack.push({
            patches,
            actionType: actionType || 'init'
          })
          useRuleStore.getState().undoRedoStack.undo = undoStack
        }
      } catch (error) {
        console.error('compare patch error', error)
      }
    }
    initApiRules(ruleStorage.apiRules || [])
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
