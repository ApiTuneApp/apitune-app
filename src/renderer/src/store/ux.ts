import { create } from 'zustand'

import { Log } from '@shared/contract'

type State = {
  proxyLogs: Log[]
  ruleSidebarExpandedKeys: string[]
  logPaused: boolean
  addProxyLogs: (log: Log) => void
  clearProxyLogs: () => void
  setLogPaused: (paused: boolean) => void
}

type Action = {
  setRuleSidebarExpandedKeys: (keys: string[]) => void
}

export const useUxStore = create<State & Action>((set) => ({
  ruleSidebarExpandedKeys: [],
  setRuleSidebarExpandedKeys: (keys) => set(() => ({ ruleSidebarExpandedKeys: keys })),
  proxyLogs: [],
  logPaused: false,
  addProxyLogs: (log: Log) =>
    set((state) => {
      if (state.logPaused) return state
      return { proxyLogs: [...state.proxyLogs, log] }
    }),
  clearProxyLogs: () => set(() => ({ proxyLogs: [] })),
  setLogPaused: (paused: boolean) => set(() => ({ logPaused: paused }))
}))
