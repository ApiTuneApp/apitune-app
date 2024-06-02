import { create } from 'zustand'

import { AppTheme, SettingStorage } from '@shared/contract'

type State = {
  port: SettingStorage['port']
  theme: SettingStorage['theme']
  // real theme apply for app
  appTheme: AppTheme
}

type Action = {
  setPort: (port: SettingStorage['port']) => void
  setTheme: (theme: SettingStorage['theme']) => void
  setAppTheme: (theme: AppTheme) => void
  initSettings: (settings: SettingStorage) => void
}

export const useSettingStore = create<State & Action>((set) => ({
  port: 8998,
  theme: 'system',
  appTheme: null,
  setPort: (port) => set(() => ({ port })),
  setTheme: (theme) => {
    window.api.changeTheme(theme)
    set(() => ({ theme }))
  },
  setAppTheme: (appTheme) => set(() => ({ appTheme })),
  initSettings: (settings: SettingStorage) => set(() => ({ ...settings }))
}))
