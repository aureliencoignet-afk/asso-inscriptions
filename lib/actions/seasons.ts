'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'
import { revalidatePath } from 'next/cache'
import type { Season } from '@/types/database'

export async function getSeasons() {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('association_id', profile.association_id)
    .order('start_date', { ascending: false })

  if (error) throw error
  return data as Season[]
}

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    return null
  }

  const { data } = await supabase
    .from('seasons')
    .select('*')
    .eq('association_id', profile.association_id)
    .eq('status', 'open')
    .order('start_date', { ascending: false })
    .limit(1)
    .single()

  return data
}

export async function createSeason(formData: Partial<Season>) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { data, error } = await supabase
    .from('seasons')
    .insert({
      ...formData,
      association_id: profile.association_id,
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/admin/seasons')
  return data
}

export async function updateSeason(id: string, formData: Partial<Season>) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { data, error } = await supabase
    .from('seasons')
    .update(formData)
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/admin/seasons')
  return data
}

export async function deleteSeason(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { error } = await supabase
    .from('seasons')
    .delete()
    .eq('id', id)
    .eq('association_id', profile.association_id)

  if (error) throw error
  
  revalidatePath('/admin/seasons')
}
