'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSubscriber, deleteSubscriber } from '@/lib/actions/subscribers'
import { ArrowLeft, Trash2, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function SubscriberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [subscriber, setSubscriber] = useState<any>(null)
  const [households, setHouseholds] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      import('@/lib/actions/subscribers').then(({ getSubscriberById }) => getSubscriberById(params.id)),
      import('@/lib/actions/households').then(({ getHouseholds }) => getHouseholds())
    ])
      .then(([subscriberData, householdsData]) => {
        setSubscriber(subscriberData)
        setHouseholds(householdsData)
      })
      .catch(err => setError('Erreur de chargement'))
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const householdId = formData.get('household_id') as string
    
    const data = {
      firstname: formData.get('firstname') as string,
      lastname: formData.get('lastname') as string,
      date_of_birth: formData.get('date_of_birth') as string || undefined,
      gender: formData.get('gender') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      household_id: householdId || undefined,
    }

    try {
      await updateSubscriber(params.id, data)
      router.push('/subscribers')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) return
    
    try {
      await deleteSubscriber(params.id)
      router.push('/subscribers')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  if (!subscriber) {
    return <div className="flex items-center justify-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/subscribers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'abonné</h1>
          <p className="text-muted-foreground mt-2">
            {subscriber.firstname} {subscriber.lastname}
          </p>
        </div>
      </div>

      {subscriber.registrations && subscriber.registrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Inscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscriber.registrations.map((registration: any) => (
                <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{registration.season?.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {registration.registration_number} - {registration.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{registration.total_net}€</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(registration.registration_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'abonné</CardTitle>
          <CardDescription>
            Modifiez les informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstname">Prénom *</Label>
                  <Input
                    id="firstname"
                    name="firstname"
                    defaultValue={subscriber.firstname}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastname">Nom *</Label>
                  <Input
                    id="lastname"
                    name="lastname"
                    defaultValue={subscriber.lastname}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="household_id">Foyer</Label>
                <select
                  id="household_id"
                  name="household_id"
                  defaultValue={subscriber.household_id || ''}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Aucun foyer</option>
                  {households.map((household) => (
                    <option key={household.id} value={household.id}>
                      {household.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    defaultValue={subscriber.date_of_birth || ''}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={subscriber.gender || ''}
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Non spécifié</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={subscriber.email || ''}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={subscriber.phone || ''}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Link href="/subscribers">
                  <Button type="button" variant="outline" disabled={loading}>
                    Annuler
                  </Button>
                </Link>
              </div>
              
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
