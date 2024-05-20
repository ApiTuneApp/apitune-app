import { create } from 'zustand'

type State = {
  ruleSidebarExpandedKeys: string[]
}

type Action = {
  setRuleSidebarExpandedKeys: (keys: string[]) => void
}

export const useUxStore = create<State & Action>((set) => ({
  ruleSidebarExpandedKeys: [],
  setRuleSidebarExpandedKeys: (keys) => set(() => ({ ruleSidebarExpandedKeys: keys }))
}))
