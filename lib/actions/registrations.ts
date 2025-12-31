'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'
import { revalidatePath } from 'next/cache'
import type { Registration } from '@/types/database'

export async function getRegistrations(filters?: {
  seasonId?: string
  status?: string
  subscriberId?: string
}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  let query = supabase
    .from('registrations')
    .select(`
      *,
      subscriber:subscribers(*),
      season:seasons(*),
      lines:registration_lines(*),
      installments:installments(*, planned_payments:planned_payments(*))
    `)
    .eq('association_id', profile.association_id)
    .order('created_at', { ascending: false })

  if (filters?.seasonId) {
    query = query.eq('season_id', filters.seasonId)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.subscriberId) {
    query = query.eq('subscriber_id', filters.subscriberId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Registration[]
}

export async function getRegistrationById(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      subscriber:subscribers(*, household:households(*)),
      season:seasons(*),
      lines:registration_lines(*, activity:activities(*)),
      installments:installments(*, planned_payments:planned_payments(*))
    `)
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .single()

  if (error) throw error
  return data
}

export async function createRegistration(data: {
  subscriberId: string
  seasonId: string
  cotisationAmount: number
  activities: Array<{ activityId: string; amount: number }>
  installmentCount: 1 | 3
  installmentDates: string[]
  payments: Array<{
    installmentRank: number
    mode: string
    amount: number
    checkNumber?: string
    bankName?: string
    reference?: string
  }>
}) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role === 'lecture') {
    throw new Error('Permission refusée')
  }

  // Calculate totals
  const activitiesTotal = data.activities.reduce((sum, act) => sum + act.amount, 0)
  const totalGross = data.cotisationAmount + activitiesTotal
  const totalNet = totalGross // TODO: Add discount logic if needed

  // Generate registration number
  const registrationNumber = `INS-${Date.now()}`

  // Start transaction
  try {
    // 1. Create registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        association_id: profile.association_id,
        season_id: data.seasonId,
        subscriber_id: data.subscriberId,
        registration_number: registrationNumber,
        status: 'validated',
        total_gross: totalGross,
        total_discount: 0,
        total_net: totalNet,
        created_by: profile.id,
      })
      .select()
      .single()

    if (regError) throw regError

    // 2. Create cotisation line
    const { error: cotisationError } = await supabase
      .from('registration_lines')
      .insert({
        registration_id: registration.id,
        line_type: 'COTISATION',
        label: 'Cotisation annuelle',
        amount: data.cotisationAmount,
      })

    if (cotisationError) throw cotisationError

    // 3. Create activity lines
    if (data.activities.length > 0) {
      const activityLines = data.activities.map(act => ({
        registration_id: registration.id,
        line_type: 'ACTIVITE' as const,
        activity_id: act.activityId,
        label: 'Activité',
        amount: act.amount,
      }))

      const { error: activitiesError } = await supabase
        .from('registration_lines')
        .insert(activityLines)

      if (activitiesError) throw activitiesError
    }

    // 4. Create installments
    const installmentAmounts = calculateInstallmentAmounts(totalNet, data.installmentCount)
    const installments = data.installmentDates.map((date, index) => ({
      registration_id: registration.id,
      rank: index + 1,
      due_date: date,
      amount: installmentAmounts[index],
      status: 'planned' as const,
    }))

    const { data: createdInstallments, error: installmentsError } = await supabase
      .from('installments')
      .insert(installments)
      .select()

    if (installmentsError) throw installmentsError

    // 5. Create planned payments
    const plannedPayments = data.payments.map(payment => {
      const installment = createdInstallments.find(inst => inst.rank === payment.installmentRank)
      return {
        installment_id: installment!.id,
        payment_mode: payment.mode,
        amount: payment.amount,
        check_number: payment.checkNumber,
        bank_name: payment.bankName,
        reference: payment.reference,
        status: 'planned' as const,
      }
    })

    const { error: paymentsError } = await supabase
      .from('planned_payments')
      .insert(plannedPayments)

    if (paymentsError) throw paymentsError

    revalidatePath('/registrations')
    return registration
  } catch (error) {
    throw error
  }
}

export async function updateRegistrationStatus(id: string, status: 'draft' | 'validated' | 'cancelled') {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role === 'lecture') {
    throw new Error('Permission refusée')
  }

  const { data, error } = await supabase
    .from('registrations')
    .update({
      status,
      updated_by: profile.id,
    })
    .eq('id', id)
    .eq('association_id', profile.association_id)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/registrations')
  revalidatePath(`/registrations/${id}`)
  return data
}

export async function deleteRegistration(id: string) {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) {
    throw new Error('Non authentifié')
  }

  if (profile.role !== 'admin') {
    throw new Error('Permission admin requise')
  }

  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id)
    .eq('association_id', profile.association_id)

  if (error) throw error
  
  revalidatePath('/registrations')
}

function calculateInstallmentAmounts(total: number, count: 1 | 3): number[] {
  if (count === 1) {
    return [total]
  }

  // For 3 installments, divide and put remainder on first installment
  const baseAmount = Math.floor((total * 100) / 3) / 100
  const remainder = Math.round((total - baseAmount * 3) * 100) / 100
  
  return [
    baseAmount + remainder,
    baseAmount,
    baseAmount,
  ]
}
