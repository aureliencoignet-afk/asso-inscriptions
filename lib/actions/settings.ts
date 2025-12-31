'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'
import { revalidatePath } from 'next/cache'

export async function getAssociationSettings() {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .eq('id', profile.association_id)
    .single()

  if (error) throw error
  return data
}

export async function updateAssociationSettings(data: {
  name?: string
  email?: string
  phone?: string
  address_line1?: string
  city?: string
  postal_code?: string
  default_cotisation_amount?: number
}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { error } = await supabase
    .from('associations')
    .update(data)
    .eq('id', profile.association_id)

  if (error) throw error
  
  revalidatePath('/settings')
}
