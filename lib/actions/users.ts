'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('association_id', profile.association_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getUserById(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .single()

  if (error) throw error
  return data
}

export async function createUser(data: {
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'gestionnaire' | 'lecture'
  password: string
}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (authError) throw authError

  // 2. Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
      association_id: profile.association_id,
    })

  if (profileError) {
    // Rollback: delete auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw profileError
  }

  revalidatePath('/admin/users')
  return authData.user
}

export async function updateUser(id: string, data: {
  first_name?: string
  last_name?: string
  role?: 'admin' | 'gestionnaire' | 'lecture'
}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  // Don't allow user to change their own role
  if (id === profile.id && data.role) {
    throw new Error('Vous ne pouvez pas modifier votre propre rôle')
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', id)
    .eq('association_id', profile.association_id)

  if (error) throw error
  
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
}

export async function deleteUser(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  // Don't allow user to delete themselves
  if (id === profile.id) {
    throw new Error('Vous ne pouvez pas supprimer votre propre compte')
  }

  // Delete auth user (will cascade delete profile via trigger)
  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) throw error
  
  revalidatePath('/admin/users')
}

export async function resetUserPassword(id: string, newPassword: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { error } = await supabase.auth.admin.updateUserById(id, {
    password: newPassword,
  })

  if (error) throw error
}
