import { ApiRules, RuleData } from '@shared/contract'
import { create } from 'zustand'

type State = {
  apiRules: ApiRules
}

type Action = {
  addRule: (rule: RuleData) => void
  initApiRules: (rules: ApiRules) => void
}

export const useRuleStore = create<State & Action>((set) => ({
  apiRules: [],
  addRule: (rule) => set((state) => ({ apiRules: [...state.apiRules, rule] })),
  initApiRules: (rules) => set(() => ({ apiRules: rules }))
}))
