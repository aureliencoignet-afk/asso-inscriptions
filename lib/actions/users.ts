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
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  // Validation
  if (!data.email || !data.password || !data.first_name || !data.last_name || !data.role) {
    throw new Error('Tous les champs sont requis')
  }

  if (data.password.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères')
  }

  // Utiliser le client admin directement
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  // 1. Créer l'utilisateur dans auth.users
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      first_name: data.first_name,
      last_name: data.last_name,
    }
  })

  if (authError) {
    console.error('Auth error:', authError)
    throw new Error(authError.message)
  }

  // 2. Créer le profil
  const { error: profileError } = await adminClient
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
    console.error('Profile error:', profileError)
    // Rollback: supprimer l'utilisateur auth
    await adminClient.auth.admin.deleteUser(authData.user.id)
    throw new Error(profileError.message)
  }

  revalidatePath('/admin/users')
  return {
    id: authData.user.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    role: data.role,
  }
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
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  // Don't allow user to delete themselves
  if (id === profile.id) {
    throw new Error('Vous ne pouvez pas supprimer votre propre compte')
  }

  // Utiliser le client admin directement
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.deleteUser(id)

  if (error) {
    console.error('Delete error:', error)
    throw new Error(error.message)
  }
  
  revalidatePath('/admin/users')
}

export async function resetUserPassword(id: string, newPassword: string) {
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères')
  }

  // Utiliser le client admin directement
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.updateUserById(id, {
    password: newPassword,
  })

  if (error) {
    console.error('Password reset error:', error)
    throw new Error(error.message)
  }
}

