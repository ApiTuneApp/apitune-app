import { ApiRules, RuleData, RuleStorage, UndoRedoPatch } from '@shared/contract'
import * as jsonPatch from 'fast-json-patch'
import { create } from 'zustand'

type State = {
  apiRules: ApiRules
  syncInfo: RuleStorage['syncInfo']
  undoRedoStack: {
    undo: UndoRedoPatch[]
    redo: UndoRedoPatch[]
  }
}

type Action = {
  addRule: (rule: RuleData) => void
  initApiRules: (rules: ApiRules) => void
  initSyncInfo: (syncInfo: RuleStorage['syncInfo']) => void
  undo: () => void
  redo: () => void
}

export const useRuleStore = create<State & Action>((set) => ({
  apiRules: [],
  syncInfo: undefined,
  undoRedoStack: {
    undo: [],
    redo: []
  },
  addRule: (rule) => set((state) => ({ apiRules: [...state.apiRules, rule] })),
  initApiRules: (rules) => set(() => ({ apiRules: rules })),
  initSyncInfo: (syncInfo) => set(() => ({ syncInfo })),
  undo: () =>
    set((state) => {
      const lastIndex = state.undoRedoStack.undo.length - 1
      const patch = state.undoRedoStack.undo[lastIndex]
      if (patch) {
        const previouseState = jsonPatch.applyPatch(
          jsonPatch.deepClone(state.apiRules),
          patch.patches
        ).newDocument
        const redoPatches = jsonPatch.compare(previouseState, state.apiRules)
        return {
          apiRules: previouseState,
          undoRedoStack: {
            undo: state.undoRedoStack.undo.slice(0, lastIndex),
            redo: [...state.undoRedoStack.redo, { patches: redoPatches, actionType: 'undo' }]
          }
        }
      }
      return {}
    }),
  redo: () =>
    set((state) => {
      const lastIndex = state.undoRedoStack.redo.length - 1
      const patch = state.undoRedoStack.redo[lastIndex]
      if (patch) {
        const previouseState = jsonPatch.applyPatch(
          jsonPatch.deepClone(state.apiRules),
          patch.patches
        ).newDocument
        return {
          apiRules: previouseState,
          undoRedoStack: {
            undo: [...state.undoRedoStack.undo, { patches: patch.patches, actionType: 'redo' }],
            redo: state.undoRedoStack.redo.slice(0, lastIndex)
          }
        }
      }
      return {}
    })
}))
