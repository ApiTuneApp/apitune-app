import { ApiRules, RuleData, RuleStorage } from '@shared/contract'
import { create } from 'zustand'

type State = {
  apiRules: ApiRules
  syncInfo: RuleStorage['syncInfo']
}

type Action = {
  addRule: (rule: RuleData) => void
  initApiRules: (rules: ApiRules) => void
  initSyncInfo: (syncInfo: RuleStorage['syncInfo']) => void
}

export const useRuleStore = create<State & Action>((set) => ({
  apiRules: [],
  syncInfo: undefined,
  addRule: (rule) => set((state) => ({ apiRules: [...state.apiRules, rule] })),
  initApiRules: (rules) => set(() => ({ apiRules: rules })),
  initSyncInfo: (syncInfo) => set(() => ({ syncInfo }))
}))
