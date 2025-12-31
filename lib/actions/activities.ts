'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'
import { revalidatePath } from 'next/cache'
import type { Activity } from '@/types/database'

export async function getActivities(seasonId?: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  let query = supabase
    .from('activities')
    .select('*, season:seasons(*)')
    .eq('association_id', profile.association_id)
    .order('name', { ascending: true })

  if (seasonId) {
    query = query.eq('season_id', seasonId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Activity[]
}

export async function getActivityById(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  const { data, error } = await supabase
    .from('activities')
    .select('*, season:seasons(*)')
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .single()

  if (error) throw error
  return data
}

export async function createActivity(formData: Partial<Activity>) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { data, error } = await supabase
    .from('activities')
    .insert({
      ...formData,
      association_id: profile.association_id,
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/admin/activities')
  return data
}

export async function updateActivity(id: string, formData: Partial<Activity>) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { data, error } = await supabase
    .from('activities')
    .update(formData)
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/admin/activities')
  revalidatePath(`/admin/activities/${id}`)
  return data
}

export async function deleteActivity(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)
    .eq('association_id', profile.association_id)

  if (error) throw error
  
  revalidatePath('/admin/activities')
}
