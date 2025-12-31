'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateRegistrationStatus, deleteRegistration } from '@/lib/actions/registrations'
import { ArrowLeft, Trash2, Download, CheckCircle2, XCircle, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function RegistrationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registration, setRegistration] = useState<any>(null)

  useEffect(() => {
    import('@/lib/actions/registrations').then(({ getRegistrationById }) => {
      getRegistrationById(params.id)
        .then(data => setRegistration(data))
        .catch(err => setError('Erreur de chargement'))
    })
  }, [params.id])

  const handleStatusChange = async (status: 'validated' | 'cancelled') => {
    if (status === 'cancelled' && !confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await updateRegistrationStatus(params.id, status)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir SUPPRIMER définitivement cette inscription ?')) return
    
    try {
      await deleteRegistration(params.id)
      router.push('/registrations')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  const handleDownloadPDF = () => {
    window.open(`/api/registrations/pdf?id=${params.id}`, '_blank')
  }

  if (!registration) {
    return <div className="flex items-center justify-center py-12">Chargement...</div>
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      validated: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    const labels = {
      draft: 'Brouillon',
      validated: 'Validée',
      cancelled: 'Annulée',
    }
    return { 
      style: styles[status as keyof typeof styles], 
      label: labels[status as keyof typeof labels] 
    }
  }

  const badge = getStatusBadge(registration.status)
  const cotisationLine = registration.lines?.find((l: any) => l.line_type === 'COTISATION')
  const activityLines = registration.lines?.filter((l: any) => l.line_type === 'ACTIVITE') || []

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/registrations">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inscription #{registration.registration_number}</h1>
            <p className="text-muted-foreground mt-2">
              {registration.subscriber?.firstname} {registration.subscriber?.lastname} - {registration.season?.label}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Status and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Statut de l'inscription</span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${badge.style}`}>
              {badge.label}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {registration.status === 'draft' && (
              <Button onClick={() => handleStatusChange('validated')} disabled={loading}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Valider l'inscription
              </Button>
            )}
            {registration.status === 'validated' && (
              <Button variant="outline" onClick={() => handleStatusChange('cancelled')} disabled={loading}>
                <XCircle className="mr-2 h-4 w-4" />
                Annuler l'inscription
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriber Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'abonné</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nom complet</p>
              <p className="font-medium">{registration.subscriber?.firstname} {registration.subscriber?.lastname}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date de naissance</p>
              <p className="font-medium">
                {registration.subscriber?.date_of_birth 
                  ? formatDate(registration.subscriber.date_of_birth)
                  : '-'
                }
              </p>
            </div>
            {registration.subscriber?.household && (
              <div>
                <p className="text-muted-foreground">Foyer</p>
                <p className="font-medium">{registration.subscriber.household.name}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{registration.subscriber?.email || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lines */}
      <Card>
        <CardHeader>
          <CardTitle>Détail de l'inscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cotisationLine && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Cotisation annuelle</p>
                  <p className="text-sm text-muted-foreground">Obligatoire</p>
                </div>
                <p className="font-bold text-lg">{formatCurrency(cotisationLine.amount)}</p>
              </div>
            )}
            
            {activityLines.length > 0 && (
              <>
                <div className="text-sm font-medium text-muted-foreground">Activités</div>
                {activityLines.map((line: any) => (
                  <div key={line.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{line.activity?.name || line.label}</p>
                      {line.activity?.description && (
                        <p className="text-sm text-muted-foreground">{line.activity.description}</p>
                      )}
                    </div>
                    <p className="font-bold">{formatCurrency(line.amount)}</p>
                  </div>
                ))}
              </>
            )}

            <div className="flex justify-between items-center pt-3 border-t-2">
              <p className="text-lg font-semibold">Total</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(registration.total_net)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installments & Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Échéancier et paiements</CardTitle>
          <CardDescription>
            {registration.installments?.length || 0} échéance(s) de paiement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {registration.installments?.map((installment: any, index: number) => (
              <div key={installment.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">Échéance {installment.rank}</p>
                    <p className="text-sm text-muted-foreground">
                      Date: {formatDate(installment.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(installment.amount)}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      installment.status === 'cashed' ? 'bg-green-100 text-green-800' :
                      installment.status === 'received' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {installment.status === 'cashed' ? 'Encaissé' :
                       installment.status === 'received' ? 'Reçu' :
                       installment.status === 'cancelled' ? 'Annulé' : 'Prévu'}
                    </span>
                  </div>
                </div>

                {installment.planned_payments?.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="text-sm">
                      <p className="font-medium">{payment.payment_mode}</p>
                      {payment.check_number && <p className="text-muted-foreground">Chèque n° {payment.check_number}</p>}
                      {payment.bank_name && <p className="text-muted-foreground">{payment.bank_name}</p>}
                      {payment.reference && <p className="text-muted-foreground">Réf: {payment.reference}</p>}
                    </div>
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
