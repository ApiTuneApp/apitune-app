import { AuthResponse, createClient } from '@supabase/supabase-js'
import { Database } from '@shared/database'

let HasStartedAutoRefresh = false

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
)

export const getSession = async () => {
  return await supabase.auth.getSession()
}

export const getUser = async () => {
  const data = await refreshAuth()
  return data?.user
}

export const startAutoRefreshSession = async () => {
  if (HasStartedAutoRefresh) return
  await supabase.auth.startAutoRefresh()
  HasStartedAutoRefresh = true
}

export const refreshAuthToken = (refresh_token: string): Promise<AuthResponse['data']> => {
  return new Promise((resolve, reject) => {
    if (!refresh_token) {
      return reject(new Error('No refresh token available'))
    }

    supabase.auth
      .refreshSession({ refresh_token })
      .then(({ data, error }) => {
        if (!error) {
          const { access_token, refresh_token } = data?.session || {}
          if (access_token && refresh_token) {
            window.api.setAuth(access_token, refresh_token)
            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)
          }
          resolve(data)
        } else {
          reject(error)
        }
      })
      .catch(reject)
  })
}

export const refreshAuth = () => {
  const access_token = localStorage.getItem('access_token')
  const refresh_token = localStorage.getItem('refresh_token')
  if (!access_token || !refresh_token) {
    return Promise.resolve(null)
  }
  return supabase.auth
    .setSession({
      access_token,
      refresh_token
    })
    .then(({ data, error }) => {
      if (!error) {
        return data
      }
      return null
    })
    .catch((error) => {
      console.error('Error auth:', error)
      refreshAuthToken(refresh_token)
      return null
    })
}

export const setAuth = (
  access_token: string,
  refresh_token: string
): Promise<AuthResponse['data']> => {
  return new Promise((resolve, reject) => {
    supabase.auth
      .setSession({
        access_token,
        refresh_token
      })
      .then(({ data, error }) => {
        if (!error) {
          window.api.setAuth(access_token, refresh_token)
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          resolve(data)
        } else {
          reject(error)
        }
      })
      .catch(reject)
  })
}

export const signOut = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  return supabase.auth.signOut()
}

export const getSubscription = async (user) => {
  if (!user || !user.email) {
    return null
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('email', user.email!)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}
