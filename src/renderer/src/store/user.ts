import { create } from 'zustand'

import { Subscription, User } from '@shared/contract'

type State = {
  user: User
  subscription: Subscription | null
}

type Action = {
  setUser: (user: User) => void
  setSubscription: (subscription: Subscription | null) => void
  isSignedIn: () => boolean
}

export const useUserStore = create<State & Action>((set, get) => ({
  user: {
    id: '',
    email: '',
    name: '',
    avatar: ''
  },
  subscription: null,
  setUser: (user) => set(() => ({ user })),
  setSubscription: (subscription) => set(() => ({ subscription })),
  isSignedIn: () => !!get().user
}))
