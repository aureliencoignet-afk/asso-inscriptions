'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requireAuth() {
  const profile = await getProfile()
  
  if (!profile) {
    redirect('/login')
  }
  
  return profile
}

export async function requireRole(requiredRole: 'admin' | 'gestionnaire') {
  const profile = await requireAuth()
  
  if (profile.role === 'lecture') {
    throw new Error('Accès non autorisé')
  }
  
  if (requiredRole === 'admin' && profile.role !== 'admin') {
    throw new Error('Accès administrateur requis')
  }
  
  return profile
}
