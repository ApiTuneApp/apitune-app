import { create } from 'zustand'

import { User } from '@shared/contract'

type State = {
  user: User
}

type Action = {
  setUser: (user: User) => void
  isSignedIn: () => boolean
}

export const useUserStore = create<State & Action>((set, get) => ({
  user: {
    id: '',
    email: '',
    name: '',
    avatar: ''
  },
  setUser: (user) => set(() => ({ user })),
  isSignedIn: () => !!get().user
}))
