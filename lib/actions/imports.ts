'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile } from './auth'

export interface ImportRow {
  // Foyer
  foyer_nom?: string
  responsable_email?: string
  responsable_telephone?: string
  adresse?: string
  
  // Abonné
  abonne_nom: string
  abonne_prenom: string
  abonne_date_naissance?: string
  abonne_email?: string
  abonne_telephone?: string
  
  // Inscription
  saison: string
  cotisation_montant: number
  
  // Activités (optionnel)
  activite_1?: string
  montant_activite_1?: number
  activite_2?: string
  montant_activite_2?: number
  activite_3?: string
  montant_activite_3?: number
  
  // Échéancier
  echeancier_nb: number
  echeance1_date?: string
  echeance1_montant?: number
  echeance1_mode?: string
  echeance2_date?: string
  echeance2_montant?: number
  echeance2_mode?: string
  echeance3_date?: string
  echeance3_montant?: number
  echeance3_mode?: string
}

export interface ImportResult {
  success: boolean
  created: number
  updated: number
  errors: Array<{
    row: number
    error: string
  }>
  details: string[]
}

export async function importInscriptions(data: ImportRow[]): Promise<ImportResult> {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) throw new Error('Non authentifié')

  const result: ImportResult = {
    success: true,
    created: 0,
    updated: 0,
    errors: [],
    details: []
  }

  // Charger les données de référence
  const [seasonsData, activitiesData] = await Promise.all([
    supabase.from('seasons').select('*').eq('association_id', profile.association_id),
    supabase.from('activities').select('*').eq('association_id', profile.association_id)
  ])

  const seasons = seasonsData.data || []
  const activities = activitiesData.data || []

  // Traiter chaque ligne
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // +2 car ligne 1 = headers

    try {
      // Validation
      if (!row.abonne_nom || !row.abonne_prenom) {
        throw new Error('Nom et prénom de l\'abonné requis')
      }

      if (!row.saison) {
        throw new Error('Saison requise')
      }

      if (!row.cotisation_montant || row.cotisation_montant <= 0) {
        throw new Error('Montant cotisation invalide')
      }

      if (!row.echeancier_nb || row.echeancier_nb < 1) {
        throw new Error('Nombre d\'échéances invalide')
      }

      // Trouver la saison
      const season = seasons.find(s => 
        s.name.toLowerCase() === row.saison.toLowerCase()
      )
      if (!season) {
        throw new Error(`Saison "${row.saison}" introuvable`)
      }

      // Créer ou trouver le foyer
      let householdId = null
      if (row.foyer_nom) {
        const { data: existingHousehold } = await supabase
          .from('households')
          .select('id')
          .eq('association_id', profile.association_id)
          .eq('name', row.foyer_nom)
          .single()

        if (existingHousehold) {
          householdId = existingHousehold.id
        } else {
          const { data: newHousehold, error: householdError } = await supabase
            .from('households')
            .insert({
              association_id: profile.association_id,
              name: row.foyer_nom,
              responsible_email: row.responsable_email,
              phone: row.responsable_telephone,
              address: row.adresse
            })
            .select()
            .single()

          if (householdError) throw householdError
          householdId = newHousehold.id
        }
      }

      // Créer ou trouver l'abonné
      const { data: existingSubscriber } = await supabase
        .from('subscribers')
        .select('id')
        .eq('association_id', profile.association_id)
        .eq('firstname', row.abonne_prenom)
        .eq('lastname', row.abonne_nom)
        .maybeSingle()

      let subscriberId
      if (existingSubscriber) {
        subscriberId = existingSubscriber.id
      } else {
        const { data: newSubscriber, error: subscriberError } = await supabase
          .from('subscribers')
          .insert({
            association_id: profile.association_id,
            household_id: householdId,
            firstname: row.abonne_prenom,
            lastname: row.abonne_nom,
            birthdate: row.abonne_date_naissance,
            email: row.abonne_email,
            phone: row.abonne_telephone
          })
          .select()
          .single()

        if (subscriberError) throw subscriberError
        subscriberId = newSubscriber.id
      }

      // Créer l'inscription
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .insert({
          association_id: profile.association_id,
          subscriber_id: subscriberId,
          season_id: season.id,
          membership_fee: row.cotisation_montant,
          status: 'active'
        })
        .select()
        .single()

      if (registrationError) throw registrationError

      // Créer les lignes d'activités
      const activityLines = []
      for (let j = 1; j <= 3; j++) {
        const activityName = row[`activite_${j}` as keyof ImportRow]
        const activityAmount = row[`montant_activite_${j}` as keyof ImportRow]
        
        if (activityName && activityAmount) {
          const activity = activities.find(a => 
            a.name.toLowerCase() === String(activityName).toLowerCase()
          )
          
          if (activity) {
            activityLines.push({
              registration_id: registration.id,
              activity_id: activity.id,
              amount: Number(activityAmount)
            })
          }
        }
      }

      if (activityLines.length > 0) {
        const { error: linesError } = await supabase
          .from('registration_lines')
          .insert(activityLines)
        
        if (linesError) throw linesError
      }

      // Créer l'échéancier
      const totalAmount = row.cotisation_montant + 
        activityLines.reduce((sum, line) => sum + line.amount, 0)
      
      const installments = []
      for (let j = 1; j <= row.echeancier_nb; j++) {
        const dueDate = row[`echeance${j}_date` as keyof ImportRow]
        const amount = row[`echeance${j}_montant` as keyof ImportRow] || 
          (totalAmount / row.echeancier_nb)
        
        installments.push({
          registration_id: registration.id,
          due_date: dueDate || new Date(new Date().setMonth(new Date().getMonth() + j - 1)).toISOString().split('T')[0],
          amount: Number(amount.toFixed(2)),
          status: 'planned'
        })
      }

      const { data: createdInstallments, error: installmentsError } = await supabase
        .from('installments')
        .insert(installments)
        .select()

      if (installmentsError) throw installmentsError

      // Créer les paiements prévus
      const plannedPayments = []
      for (let j = 0; j < createdInstallments.length; j++) {
        const mode = row[`echeance${j + 1}_mode` as keyof ImportRow] || 'CHEQUE'
        
        plannedPayments.push({
          installment_id: createdInstallments[j].id,
          amount: createdInstallments[j].amount,
          payment_mode: String(mode).toUpperCase(),
          status: 'planned'
        })
      }

      const { error: paymentsError } = await supabase
        .from('planned_payments')
        .insert(plannedPayments)

      if (paymentsError) throw paymentsError

      result.created++
      result.details.push(`Ligne ${rowNum}: ${row.abonne_prenom} ${row.abonne_nom} - Inscription créée`)

    } catch (error: any) {
      result.errors.push({
        row: rowNum,
        error: error.message
      })
      result.details.push(`Ligne ${rowNum}: ERREUR - ${error.message}`)
    }
  }

  result.success = result.errors.length === 0

  return result
}

// Valider les données avant import
export async function validateImportData(data: ImportRow[]): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
}> {
  const supabase = await createClient()
  const profile = await getProfile()
  
  if (!profile) throw new Error('Non authentifié')

  const errors: string[] = []
  const warnings: string[] = []

  // Charger les données de référence
  const [seasonsData, activitiesData] = await Promise.all([
    supabase.from('seasons').select('name').eq('association_id', profile.association_id),
    supabase.from('activities').select('name').eq('association_id', profile.association_id)
  ])

  const seasonNames = seasonsData.data?.map(s => s.name.toLowerCase()) || []
  const activityNames = activitiesData.data?.map(a => a.name.toLowerCase()) || []

  data.forEach((row, index) => {
    const rowNum = index + 2

    // Validation des champs obligatoires
    if (!row.abonne_nom) errors.push(`Ligne ${rowNum}: Nom abonné manquant`)
    if (!row.abonne_prenom) errors.push(`Ligne ${rowNum}: Prénom abonné manquant`)
    if (!row.saison) errors.push(`Ligne ${rowNum}: Saison manquante`)
    if (!row.cotisation_montant) errors.push(`Ligne ${rowNum}: Montant cotisation manquant`)
    if (!row.echeancier_nb) errors.push(`Ligne ${rowNum}: Nombre d'échéances manquant`)

    // Validation de la saison
    if (row.saison && !seasonNames.includes(row.saison.toLowerCase())) {
      errors.push(`Ligne ${rowNum}: Saison "${row.saison}" introuvable`)
    }

    // Validation des activités
    for (let i = 1; i <= 3; i++) {
      const activityName = row[`activite_${i}` as keyof ImportRow]
      if (activityName && !activityNames.includes(String(activityName).toLowerCase())) {
        warnings.push(`Ligne ${rowNum}: Activité "${activityName}" introuvable`)
      }
    }

    // Validation du montant
    if (row.cotisation_montant && row.cotisation_montant <= 0) {
      errors.push(`Ligne ${rowNum}: Montant cotisation invalide`)
    }

    // Validation de l'échéancier
    if (row.echeancier_nb && row.echeancier_nb < 1) {
      errors.push(`Ligne ${rowNum}: Nombre d'échéances invalide`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
