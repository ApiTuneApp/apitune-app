import { ApiRules, RuleData, RuleStorage } from '@shared/contract'
import { create } from 'zustand'

type State = {
  apiRules: ApiRules
  syncInfo: RuleStorage['syncInfo']
  ruleInited: boolean
}

type Action = {
  addRule: (rule: RuleData) => void
  setRuleInited: (inited: boolean) => void
  initApiRules: (rules: ApiRules) => void
  initSyncInfo: (syncInfo: RuleStorage['syncInfo']) => void
}

export const useRuleStore = create<State & Action>((set) => ({
  apiRules: [],
  syncInfo: undefined,
  ruleInited: false,
  addRule: (rule) => set((state) => ({ apiRules: [...state.apiRules, rule] })),
  setRuleInited: (inited) => set(() => ({ ruleInited: inited })),
  initApiRules: (rules) => set(() => ({ apiRules: rules })),
  initSyncInfo: (syncInfo) => set(() => ({ syncInfo }))
}))
