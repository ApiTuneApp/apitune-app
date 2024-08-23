import { AuthResponse, createClient } from '@supabase/supabase-js'

let HasStartedAutoRefresh = false

// Create a single supabase client for interacting with your database
export const supabase = createClient(
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
