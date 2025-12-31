'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'
import { revalidatePath } from 'next/cache'
import type { Household } from '@/types/database'

export async function getHouseholds() {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('association_id', profile.association_id)
    .order('name', { ascending: true })

  if (error) throw error
  return data as Household[]
}

export async function getHouseholdById(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  const { data, error } = await supabase
    .from('households')
    .select('*, subscribers(*)')
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .single()

  if (error) throw error
  return data
}

export async function createHousehold(formData: Partial<Household>) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role === 'lecture') {
    throw new Error('Permission refusée')
  }

  const { data, error } = await supabase
    .from('households')
    .insert({
      ...formData,
      association_id: profile.association_id,
      created_by: profile.id,
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/households')
  return data
}

export async function updateHousehold(id: string, formData: Partial<Household>) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role === 'lecture') {
    throw new Error('Permission refusée')
  }

  const { data, error } = await supabase
    .from('households')
    .update({
      ...formData,
      updated_by: profile.id,
    })
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/households')
  revalidatePath(`/households/${id}`)
  return data
}

export async function deleteHousehold(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { error } = await supabase
    .from('households')
    .delete()
    .eq('id', id)
    .eq('association_id', profile.association_id)

  if (error) throw error
  
  revalidatePath('/households')
}
