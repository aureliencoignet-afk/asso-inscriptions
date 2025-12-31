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
  // Cette fonction appelle maintenant l'API route sécurisée
  // qui utilise le client admin côté serveur
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Erreur lors de la création de l\'utilisateur')
  }

  revalidatePath('/admin/users')
  return result.user
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
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Erreur lors de la suppression')
  }
  
  revalidatePath('/admin/users')
}

export async function resetUserPassword(id: string, newPassword: string) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'reset_password',
      password: newPassword,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Erreur lors de la réinitialisation')
  }
}
