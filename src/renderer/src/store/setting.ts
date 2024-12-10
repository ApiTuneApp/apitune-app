import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { AppTheme, SettingStorage } from '@shared/contract'

type State = {
  port: SettingStorage['port']
  theme: SettingStorage['theme']
  language: SettingStorage['language']
  // real theme apply for app
  appTheme: AppTheme
  httpsDecryptDomains: string[]
}

type Action = {
  setPort: (port: SettingStorage['port']) => void
  setTheme: (theme: SettingStorage['theme']) => void
  setAppTheme: (theme: AppTheme) => void
  setLanguage: (language: SettingStorage['language']) => void
  initSettings: (settings: SettingStorage) => void
  setHttpsDecryptDomains: (domains: string[]) => void
}

export const useSettingStore = create<State & Action>((set) => ({
  port: 8998,
  theme: 'system',
  appTheme: null,
  language: 'en',
  httpsDecryptDomains: [],
  setPort: (port) => set(() => ({ port })),
  setTheme: (theme) => {
    window.api.changeTheme(theme)
    set(() => ({ theme }))
  },
  setAppTheme: (appTheme) => set(() => ({ appTheme })),
  setLanguage: (language) => set(() => ({ language })),
  initSettings: (settings: SettingStorage) => set(() => ({ ...settings })),
  setHttpsDecryptDomains: (domains) => set({ httpsDecryptDomains: domains })
}))
