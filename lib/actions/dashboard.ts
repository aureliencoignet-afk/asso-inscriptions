'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'
import type { DashboardStats } from '@/types/database'

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  // Total registrations
  const { count: totalRegistrations } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('association_id', profile.association_id)
    .eq('status', 'validated')

  // Total expected (sum of all validated registrations)
  const { data: registrationsData } = await supabase
    .from('registrations')
    .select('total_net')
    .eq('association_id', profile.association_id)
    .eq('status', 'validated')

  const totalExpected = registrationsData?.reduce((sum, reg) => sum + parseFloat(reg.total_net.toString()), 0) || 0

  // Total cashed (installments with status 'cashed')
  const { data: cashedInstallments } = await supabase
    .from('installments')
    .select('amount, registration:registrations!inner(association_id)')
    .eq('registration.association_id', profile.association_id)
    .eq('status', 'cashed')

  const totalCashed = cashedInstallments?.reduce((sum, inst) => sum + parseFloat(inst.amount.toString()), 0) || 0

  // Upcoming installments (due in next 30 days, status 'planned')
  const today = new Date()
  const in30Days = new Date()
  in30Days.setDate(today.getDate() + 30)

  const { count: upcomingInstallments } = await supabase
    .from('installments')
    .select('*, registration:registrations!inner(association_id)', { count: 'exact', head: true })
    .eq('registration.association_id', profile.association_id)
    .eq('status', 'planned')
    .gte('due_date', today.toISOString().split('T')[0])
    .lte('due_date', in30Days.toISOString().split('T')[0])

  // Overdue installments (due date passed, status still 'planned')
  const { count: overdueInstallments } = await supabase
    .from('installments')
    .select('*, registration:registrations!inner(association_id)', { count: 'exact', head: true })
    .eq('registration.association_id', profile.association_id)
    .eq('status', 'planned')
    .lt('due_date', today.toISOString().split('T')[0])

  return {
    totalRegistrations: totalRegistrations || 0,
    totalExpected: Number(totalExpected.toFixed(2)),
    totalCashed: Number(totalCashed.toFixed(2)),
    upcomingInstallments: upcomingInstallments || 0,
    overdueInstallments: overdueInstallments || 0,
  }
}
