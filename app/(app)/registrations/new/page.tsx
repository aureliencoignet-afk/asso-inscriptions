'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createRegistration } from '@/lib/actions/registrations'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface FormData {
  subscriberId: string
  seasonId: string
  cotisationAmount: number
  activities: Array<{ activityId: string; activityName: string; amount: number }>
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
}

export default function NewRegistrationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [seasons, setSeasons] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  
  const [formData, setFormData] = useState<FormData>({
    subscriberId: '',
    seasonId: '',
    cotisationAmount: 50,
    activities: [],
    installmentCount: 1,
    installmentDates: [new Date().toISOString().split('T')[0]],
    payments: [],
  })

  useEffect(() => {
    Promise.all([
      import('@/lib/actions/subscribers').then(({ getSubscribers }) => getSubscribers()),
      import('@/lib/actions/seasons').then(({ getSeasons }) => getSeasons()),
      import('@/lib/actions/activities').then(({ getActivities }) => getActivities()),
    ])
      .then(([subsData, seasonsData, activitiesData]) => {
        setSubscribers(subsData)
        setSeasons(seasonsData)
        setActivities(activitiesData)
      })
      .catch(err => setError('Erreur de chargement des données'))
  }, [])

  const calculateTotal = () => {
    const activitiesTotal = formData.activities.reduce((sum, act) => sum + act.amount, 0)
    return formData.cotisationAmount + activitiesTotal
  }

  const addActivity = () => {
    setFormData({
      ...formData,
      activities: [...formData.activities, { activityId: '', activityName: '', amount: 0 }],
    })
  }

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index),
    })
  }

  const updateActivity = (index: number, field: string, value: any) => {
    const updated = [...formData.activities]
    if (field === 'activityId') {
      const activity = activities.find(a => a.id === value)
      updated[index] = {
        activityId: value,
        activityName: activity?.name || '',
        amount: activity?.base_price || 0,
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setFormData({ ...formData, activities: updated })
  }

  const handleInstallmentCountChange = (count: 1 | 3) => {
    const total = calculateTotal()
    const today = new Date()
    
    if (count === 1) {
      setFormData({
        ...formData,
        installmentCount: 1,
        installmentDates: [today.toISOString().split('T')[0]],
        payments: [{ installmentRank: 1, mode: 'CHEQUE', amount: total }],
      })
    } else {
      const dates = [
        today.toISOString().split('T')[0],
        new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0],
        new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0],
      ]
      
      const baseAmount = Math.floor((total * 100) / 3) / 100
      const remainder = Math.round((total - baseAmount * 3) * 100) / 100
      
      setFormData({
        ...formData,
        installmentCount: 3,
        installmentDates: dates,
        payments: [
          { installmentRank: 1, mode: 'CHEQUE', amount: baseAmount + remainder },
          { installmentRank: 2, mode: 'CHEQUE', amount: baseAmount },
          { installmentRank: 3, mode: 'CHEQUE', amount: baseAmount },
        ],
      })
    }
  }

  const updatePayment = (index: number, field: string, value: any) => {
    const updated = [...formData.payments]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, payments: updated })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      await createRegistration(formData)
      router.push('/registrations')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.subscriberId && formData.seasonId
      case 2:
        return formData.cotisationAmount > 0
      case 3:
        return true // Activities are optional
      case 4:
        return formData.installmentDates.every(d => d)
      case 5:
        return formData.payments.every(p => p.mode && p.amount > 0)
      default:
        return true
    }
  }

  const steps = [
    { num: 1, label: 'Abonné & Saison' },
    { num: 2, label: 'Cotisation' },
    { num: 3, label: 'Activités' },
    { num: 4, label: 'Échéancier' },
    { num: 5, label: 'Paiements' },
    { num: 6, label: 'Récapitulatif' },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/registrations">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle inscription</h1>
          <p className="text-muted-foreground mt-2">
            Créez une inscription en {steps.length} étapes
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === step.num
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.num
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.num ? <Check className="h-5 w-5" /> : step.num}
              </div>
              <span className="text-xs mt-1 text-center">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Étape {currentStep} : {steps[currentStep - 1].label}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Sélectionnez l\'abonné et la saison'}
            {currentStep === 2 && 'Définissez le montant de la cotisation'}
            {currentStep === 3 && 'Ajoutez les activités choisies'}
            {currentStep === 4 && 'Configurez l\'échéancier de paiement'}
            {currentStep === 5 && 'Définissez les modalités de paiement'}
            {currentStep === 6 && 'Vérifiez et validez l\'inscription'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Subscriber & Season */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="subscriber">Abonné *</Label>
                <select
                  id="subscriber"
                  value={formData.subscriberId}
                  onChange={(e) => setFormData({ ...formData, subscriberId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Sélectionnez un abonné</option>
                  {subscribers.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.firstname} {sub.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="season">Saison *</Label>
                <select
                  id="season"
                  value={formData.seasonId}
                  onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Sélectionnez une saison</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Cotisation */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cotisation">Montant de la cotisation (€) *</Label>
                <Input
                  id="cotisation"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cotisationAmount}
                  onChange={(e) => setFormData({ ...formData, cotisationAmount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Montant standard de la cotisation annuelle
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Activities */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Ajoutez les activités pour cette inscription</p>
                <Button type="button" size="sm" onClick={addActivity}>
                  Ajouter une activité
                </Button>
              </div>
              
              {formData.activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune activité ajoutée. Cliquez sur "Ajouter une activité" pour commencer.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.activities.map((activity, index) => (
                    <div key={index} className="flex gap-3 items-start p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label>Activité</Label>
                          <select
                            value={activity.activityId}
                            onChange={(e) => updateActivity(index, 'activityId', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Sélectionner</option>
                            {activities.map((act) => (
                              <option key={act.id} value={act.id}>
                                {act.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Montant (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={activity.amount}
                            onChange={(e) => updateActivity(index, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeActivity(index)}
                        className="mt-6"
                      >
                        Retirer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="font-semibold text-blue-900">Total de l'inscription</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Cotisation</span>
                    <span>{formatCurrency(formData.cotisationAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activités ({formData.activities.length})</span>
                    <span>{formatCurrency(formData.activities.reduce((sum, a) => sum + a.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-blue-300">
                    <span>Total</span>
                    <span className="text-blue-900">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Installments */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label>Nombre d'échéances</Label>
                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleInstallmentCountChange(1)}
                    className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                      formData.installmentCount === 1
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">Paiement en 1 fois</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Totalité : {formatCurrency(calculateTotal())}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstallmentCountChange(3)}
                    className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                      formData.installmentCount === 3
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">Paiement en 3 fois</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      3 x {formatCurrency(calculateTotal() / 3)}
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {formData.installmentDates.map((date, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="font-semibold min-w-[100px]">
                      Échéance {index + 1}
                    </div>
                    <div className="flex-1">
                      <Label>Date d'échéance</Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          const updated = [...formData.installmentDates]
                          updated[index] = e.target.value
                          setFormData({ ...formData, installmentDates: updated })
                        }}
                      />
                    </div>
                    <div className="min-w-[120px] text-right">
                      <p className="text-sm text-muted-foreground">Montant</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(formData.payments[index]?.amount || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Payments */}
          {currentStep === 5 && (
            <div className="space-y-4">
              {formData.payments.map((payment, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Échéance {payment.installmentRank}</h4>
                    <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Mode de paiement</Label>
                      <select
                        value={payment.mode}
                        onChange={(e) => updatePayment(index, 'mode', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="CHEQUE">Chèque</option>
                        <option value="LIQUIDE">Liquide</option>
                        <option value="VIREMENT">Virement</option>
                        <option value="CB">Carte bancaire</option>
                        <option value="AUTRE">Autre</option>
                      </select>
                    </div>
                    
                    {payment.mode === 'CHEQUE' && (
                      <>
                        <div>
                          <Label>Numéro de chèque</Label>
                          <Input
                            value={payment.checkNumber || ''}
                            onChange={(e) => updatePayment(index, 'checkNumber', e.target.value)}
                            placeholder="1234567"
                          />
                        </div>
                        <div>
                          <Label>Banque</Label>
                          <Input
                            value={payment.bankName || ''}
                            onChange={(e) => updatePayment(index, 'bankName', e.target.value)}
                            placeholder="Nom de la banque"
                          />
                        </div>
                      </>
                    )}
                    
                    {payment.mode === 'VIREMENT' && (
                      <div>
                        <Label>Référence</Label>
                        <Input
                          value={payment.reference || ''}
                          onChange={(e) => updatePayment(index, 'reference', e.target.value)}
                          placeholder="Référence du virement"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 6: Summary */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✓ Inscription prête à être créée</h3>
                <p className="text-sm text-green-700">
                  Vérifiez les informations ci-dessous avant de valider l'inscription.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Abonné & Saison</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Abonné :</strong> {subscribers.find(s => s.id === formData.subscriberId)?.firstname} {subscribers.find(s => s.id === formData.subscriberId)?.lastname}</p>
                    <p><strong>Saison :</strong> {seasons.find(s => s.id === formData.seasonId)?.label}</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Montants</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Cotisation</span>
                      <span>{formatCurrency(formData.cotisationAmount)}</span>
                    </div>
                    {formData.activities.map((act, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{act.activityName}</span>
                        <span>{formatCurrency(act.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Échéancier</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Nombre d'échéances :</strong> {formData.installmentCount}</p>
                    {formData.payments.map((payment, i) => (
                      <div key={i} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">Échéance {payment.installmentRank}</p>
                          <p className="text-xs text-muted-foreground">
                            {formData.installmentDates[i]} - {payment.mode}
                          </p>
                        </div>
                        <p className="font-bold">{formatCurrency(payment.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1) as Step)}
          disabled={currentStep === 1 || loading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        
        {currentStep < 6 ? (
          <Button
            onClick={() => setCurrentStep(Math.min(6, currentStep + 1) as Step)}
            disabled={!canGoNext() || loading}
          >
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création...' : 'Créer l\'inscription'}
          </Button>
        )}
      </div>
    </div>
  )
}
