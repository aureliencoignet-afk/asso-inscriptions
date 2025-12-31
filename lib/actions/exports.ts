'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'

export type ExportType = 
  | 'cheques' 
  | 'echeances' 
  | 'retards' 
  | 'inscriptions' 
  | 'tresorerie'
  | 'comptable'

export interface ExportFilters {
  season_id?: string
  date_debut?: string
  date_fin?: string
  payment_mode?: string
  status?: string
  activity_id?: string
  household_id?: string
}

// Export Chèques à encaisser
export async function exportCheques(filters: ExportFilters = {}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) throw new Error('Non authentifié')

  let query = supabase
    .from('planned_payments')
    .select(`
      *,
      installment:installments!inner(
        *,
        registration:registrations!inner(
          *,
          subscriber:subscribers!inner(*,
            household:households(*)
          ),
          season:seasons(*),
          lines:registration_lines(
            *,
            activity:activities(*)
          )
        )
      )
    `)
    .eq('installment.registration.association_id', profile.association_id)
    .eq('payment_mode', 'CHEQUE')
    .in('status', ['planned', 'received'])
    .order('received_date', { ascending: true, nullsFirst: false })
    .order('due_date', { ascending: true })

  if (filters.season_id) {
    query = query.eq('installment.registration.season_id', filters.season_id)
  }

  if (filters.date_debut) {
    query = query.gte('installment.due_date', filters.date_debut)
  }

  if (filters.date_fin) {
    query = query.lte('installment.due_date', filters.date_fin)
  }

  const { data, error } = await query

  if (error) throw error

  return data.map((pp: any) => ({
    date_echeance: pp.installment.due_date,
    date_reception: pp.received_date,
    montant: pp.amount,
    foyer: pp.installment.registration.subscriber.household?.name || '-',
    abonne: `${pp.installment.registration.subscriber.firstname} ${pp.installment.registration.subscriber.lastname}`,
    num_inscription: pp.installment.registration.registration_number,
    activites: pp.installment.registration.lines?.map((l: any) => l.activity?.name).join(', ') || '-',
    num_cheque: pp.check_number || '',
    banque: pp.bank_name || '',
    statut: pp.status === 'received' ? 'Reçu' : 'Prévu',
    notes: pp.notes || ''
  }))
}

// Export Échéances à venir
export async function exportEcheances(filters: ExportFilters = {}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) throw new Error('Non authentifié')

  const today = new Date().toISOString().split('T')[0]
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  let query = supabase
    .from('installments')
    .select(`
      *,
      registration:registrations!inner(
        *,
        subscriber:subscribers!inner(*,
          household:households(*)
        ),
        season:seasons(*),
        lines:registration_lines(
          *,
          activity:activities(*)
        )
      ),
      payments:planned_payments(*)
    `)
    .eq('registration.association_id', profile.association_id)
    .eq('status', 'planned')
    .gte('due_date', filters.date_debut || today)
    .lte('due_date', filters.date_fin || in30Days)
    .order('due_date', { ascending: true })

  if (filters.season_id) {
    query = query.eq('registration.season_id', filters.season_id)
  }

  const { data, error } = await query

  if (error) throw error

  return data.map((inst: any) => ({
    date_echeance: inst.due_date,
    montant: inst.amount,
    foyer: inst.registration.subscriber.household?.name || '-',
    abonne: `${inst.registration.subscriber.firstname} ${inst.registration.subscriber.lastname}`,
    num_inscription: inst.registration.registration_number,
    saison: inst.registration.season?.name || '',
    activites: inst.registration.lines?.map((l: any) => l.activity?.name).join(', ') || '-',
    modes_paiement: inst.payments?.map((p: any) => p.payment_mode).join(', ') || '-',
    statut: inst.status === 'paid' ? 'Payé' : inst.status === 'overdue' ? 'En retard' : 'Prévu'
  }))
}

// Export Paiements en retard
export async function exportRetards(filters: ExportFilters = {}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) throw new Error('Non authentifié')

  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('installments')
    .select(`
      *,
      registration:registrations!inner(
        *,
        subscriber:subscribers!inner(*,
          household:households(*)
        ),
        season:seasons(*),
        lines:registration_lines(
          *,
          activity:activities(*)
        )
      ),
      payments:planned_payments(*)
    `)
    .eq('registration.association_id', profile.association_id)
    .eq('status', 'planned')
    .lt('due_date', today)
    .order('due_date', { ascending: true })

  if (filters.season_id) {
    query = query.eq('registration.season_id', filters.season_id)
  }

  const { data, error } = await query

  if (error) throw error

  return data.map((inst: any) => {
    const daysLate = Math.floor((new Date().getTime() - new Date(inst.due_date).getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      date_echeance: inst.due_date,
      jours_retard: daysLate,
      montant: inst.amount,
      foyer: inst.registration.subscriber.household?.name || '-',
      abonne: `${inst.registration.subscriber.firstname} ${inst.registration.subscriber.lastname}`,
      email: inst.registration.subscriber.email || inst.registration.subscriber.household?.responsible_email || '',
      telephone: inst.registration.subscriber.phone || inst.registration.subscriber.household?.phone || '',
      num_inscription: inst.registration.registration_number,
      saison: inst.registration.season?.name || '',
      activites: inst.registration.lines?.map((l: any) => l.activity?.name).join(', ') || '-',
      modes_paiement: inst.payments?.map((p: any) => p.payment_mode).join(', ') || '-'
    }
  })
}

// Export État des inscriptions
export async function exportInscriptions(filters: ExportFilters = {}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) throw new Error('Non authentifié')

  let query = supabase
    .from('registrations')
    .select(`
      *,
      subscriber:subscribers!inner(*,
        household:households(*)
      ),
      season:seasons(*),
      lines:registration_lines(
        *,
        activity:activities(*)
      ),
      installments(
        *,
        payments:planned_payments(*)
      )
    `)
    .eq('association_id', profile.association_id)
    .order('created_at', { ascending: false })

  if (filters.season_id) {
    query = query.eq('season_id', filters.season_id)
  }

  if (filters.activity_id) {
    query = query.eq('lines.activity_id', filters.activity_id)
  }

  const { data, error } = await query

  if (error) throw error

  return data.map((reg: any) => {
    const totalAmount = reg.membership_fee + (reg.lines?.reduce((sum: number, l: any) => sum + l.amount, 0) || 0)
    const paidAmount = reg.installments?.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.amount, 0) || 0
    const remainingAmount = totalAmount - paidAmount

    return {
      num_inscription: reg.registration_number,
      date_inscription: reg.created_at.split('T')[0],
      statut: reg.status === 'active' ? 'Active' : reg.status === 'pending' ? 'En attente' : 'Annulée',
      foyer: reg.subscriber.household?.name || '-',
      abonne: `${reg.subscriber.firstname} ${reg.subscriber.lastname}`,
      email: reg.subscriber.email || reg.subscriber.household?.responsible_email || '',
      telephone: reg.subscriber.phone || reg.subscriber.household?.phone || '',
      saison: reg.season?.name || '',
      activites: reg.lines?.map((l: any) => l.activity?.name).join(', ') || '-',
      cotisation: reg.membership_fee,
      total_activites: reg.lines?.reduce((sum: number, l: any) => sum + l.amount, 0) || 0,
      montant_total: totalAmount,
      montant_paye: paidAmount,
      reste_a_payer: remainingAmount,
      nb_echeances: reg.installments?.length || 0,
      nb_echeances_payees: reg.installments?.filter((i: any) => i.status === 'paid').length || 0
    }
  })
}

// Export Trésorerie
export async function exportTresorerie(filters: ExportFilters = {}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) throw new Error('Non authentifié')

  let query = supabase
    .from('planned_payments')
    .select(`
      *,
      installment:installments!inner(
        *,
        registration:registrations!inner(
          *,
          subscriber:subscribers!inner(*),
          season:seasons(*)
        )
      )
    `)
    .eq('installment.registration.association_id', profile.association_id)
    .order('received_date', { ascending: true, nullsFirst: false })
    .order('cashed_date', { ascending: true, nullsFirst: false })

  if (filters.season_id) {
    query = query.eq('installment.registration.season_id', filters.season_id)
  }

  if (filters.date_debut) {
    query = query.gte('installment.due_date', filters.date_debut)
  }

  if (filters.date_fin) {
    query = query.lte('installment.due_date', filters.date_fin)
  }

  if (filters.payment_mode) {
    query = query.eq('payment_mode', filters.payment_mode)
  }

  const { data, error } = await query

  if (error) throw error

  return data.map((pp: any) => ({
    date_echeance: pp.installment.due_date,
    date_reception: pp.received_date || '',
    date_encaissement: pp.cashed_date || '',
    montant: pp.amount,
    mode_paiement: pp.payment_mode,
    num_cheque: pp.check_number || '',
    banque: pp.bank_name || '',
    num_transaction: pp.transaction_reference || '',
    statut: pp.status === 'cashed' ? 'Encaissé' : pp.status === 'received' ? 'Reçu' : 'Prévu',
    abonne: `${pp.installment.registration.subscriber.firstname} ${pp.installment.registration.subscriber.lastname}`,
    num_inscription: pp.installment.registration.registration_number,
    saison: pp.installment.registration.season?.name || ''
  }))
}
