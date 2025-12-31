'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'
import { revalidatePath } from 'next/cache'
import type { Subscriber } from '@/types/database'

export async function getSubscribers(householdId?: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  let query = supabase
    .from('subscribers')
    .select('*, household:households(*)')
    .eq('association_id', profile.association_id)
    .order('lastname', { ascending: true })

  if (householdId) {
    query = query.eq('household_id', householdId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Subscriber[]
}

export async function getSubscriberById(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('*, household:households(*), registrations(*, season:seasons(*))')
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .single()

  if (error) throw error
  return data
}

export async function createSubscriber(formData: Partial<Subscriber>) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role === 'lecture') {
    throw new Error('Permission refusée')
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert({
      ...formData,
      association_id: profile.association_id,
      created_by: profile.id,
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/subscribers')
  return data
}

export async function updateSubscriber(id: string, formData: Partial<Subscriber>) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role === 'lecture') {
    throw new Error('Permission refusée')
  }

  const { data, error } = await supabase
    .from('subscribers')
    .update({
      ...formData,
      updated_by: profile.id,
    })
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/subscribers')
  revalidatePath(`/subscribers/${id}`)
  return data
}

export async function deleteSubscriber(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('id', id)
    .eq('association_id', profile.association_id)

  if (error) throw error
  
  revalidatePath('/subscribers')
}
