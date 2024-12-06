import { ApiRuleItem, ApiRules, ShareRule } from '@shared/contract'

import { supabase } from './auth'

export const getUserRules = async () => {
  const user = await supabase.auth.getUser()
  if (!user || !user.data.user?.id) {
    throw new Error('User not authenticated')
  }
  const userId = user.data.user.id
  const { data, error } = await supabase.from('rules').select('*').eq('user_id', userId).single()
  if (error) {
    throw error
  }
  return data
}

export const syncRuleData = async (rule_data: ApiRules) => {
  // Step 1: Get the authenticated user
  const user = await supabase.auth.getUser()
  if (!user || !user.data.user?.id) {
    throw new Error('User not authenticated')
  }

  if (!rule_data || rule_data.length === 0) {
    throw new Error('No rule data provided')
  }

  const userId = user.data.user.id

  const { data: existingRules, error: existingRulesError } = await supabase
    .from('rules')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existingRulesError && existingRulesError.code !== 'PGRST116') {
    // PGRST116 is the code for "No rows found"
    throw existingRulesError
  }

  let result
  const updated_at = new Date().toISOString()
  if (existingRules) {
    // Step 3a: Update the existing row
    const { data, error } = await supabase
      .from('rules')
      .update({ rule_data: rule_data as any, updated_at: updated_at })
      .eq('user_id', userId)

    if (error) {
      throw error
    }
    result = data
  } else {
    // Step 3b: Insert new data
    const { data, error } = await supabase.from('rules').insert([
      {
        rule_data: rule_data as any,
        user_id: userId,
        updated_at: updated_at
      }
    ])

    if (error) {
      throw error
    }
    result = data
  }

  return {
    updated_at: updated_at,
    data: result
  }
}

export const generateShareLink = async (userId: string, ruleData: ApiRuleItem): Promise<string> => {
  if (!userId) {
    throw new Error('User not authenticated')
  }
  const { data, error } = await supabase
    .from('shareRules')
    .insert([
      {
        rule_data: ruleData as any,
        user_id: userId,
        updated_at: new Date().toISOString()
      }
    ])
    .select('id')
    .single()
  if (error) {
    throw error
  }
  return data?.id
}

export const getShareRule = async (shareId: string): Promise<ShareRule | null> => {
  if (!shareId) {
    throw new Error('Share ID is required')
  }
  const { data, error } = await supabase
    .from('shareRules')
    .select(
      `
          *,
          users:user_id (
            id,
            avatar_url,
            full_name
          )
        `
    )
    .eq('id', shareId)
    .single()
  if (error) {
    throw error
  }
  return data as unknown as ShareRule
}

export const getShareRules = async (userId: string): Promise<ShareRule[]> => {
  const { data, error } = await supabase.from('shareRules').select('*').eq('user_id', userId)
  if (error) {
    throw error
  }
  return data as unknown as ShareRule[]
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
