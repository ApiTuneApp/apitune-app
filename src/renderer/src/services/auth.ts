import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// export const login = async (provider: 'google' | 'github') => {
//   return await supabase.auth.signInWithOAuth({
//     provider: provider,
//     options: {
//       redirectTo: import.meta.env.VITE_SITE_URL + '/auth/callback?next=/login/success?source=app',
//       skipBrowserRedirect: true
//     }
//   })
// }

export const getSession = async () => {
  return await supabase.auth.getSession()
}

export const getUser = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user
}
