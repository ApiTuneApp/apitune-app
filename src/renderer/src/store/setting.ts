import { create } from 'zustand'

import { SettingStorage } from '@shared/contract'

type State = {
  port: SettingStorage['port']
  theme: SettingStorage['theme']
}

type Action = {
  setPort: (port: SettingStorage['port']) => void
  setTheme: (theme: SettingStorage['theme']) => void
  initSettings: (settings: SettingStorage) => void
}

export const useSettingStore = create<State & Action>((set) => ({
  port: 8998,
  theme: 'system',
  setPort: (port) => set(() => ({ port })),
  setTheme: (theme) => set(() => ({ theme })),
  initSettings: (settings: SettingStorage) => set(() => ({ ...settings }))
}))
