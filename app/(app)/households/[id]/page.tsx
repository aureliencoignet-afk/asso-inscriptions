'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateHousehold, deleteHousehold } from '@/lib/actions/households'
import { ArrowLeft, Trash2, Users } from 'lucide-react'
import Link from 'next/link'

export default function HouseholdDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [household, setHousehold] = useState<any>(null)

  useEffect(() => {
    import('@/lib/actions/households').then(({ getHouseholdById }) => {
      getHouseholdById(params.id)
        .then(data => setHousehold(data))
        .catch(err => setError('Erreur de chargement'))
    })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      responsible_firstname: formData.get('responsible_firstname') as string,
      responsible_lastname: formData.get('responsible_lastname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address_line1: formData.get('address_line1') as string,
      address_line2: formData.get('address_line2') as string,
      postal_code: formData.get('postal_code') as string,
      city: formData.get('city') as string,
      notes: formData.get('notes') as string,
    }

    try {
      await updateHousehold(params.id, data)
      router.push('/households')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce foyer ?')) return
    
    try {
      await deleteHousehold(params.id)
      router.push('/households')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  if (!household) {
    return <div className="flex items-center justify-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/households">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le foyer</h1>
          <p className="text-muted-foreground mt-2">
            {household.name}
          </p>
        </div>
      </div>

      {household.subscribers && household.subscribers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membres du foyer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {household.subscribers.map((subscriber: any) => (
                <Link key={subscriber.id} href={`/subscribers/${subscriber.id}`}>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium">{subscriber.firstname} {subscriber.lastname}</p>
                      {subscriber.date_of_birth && (
                        <p className="text-sm text-muted-foreground">
                          Né(e) le {new Date(subscriber.date_of_birth).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">Voir</Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations du foyer</CardTitle>
          <CardDescription>
            Modifiez les informations du foyer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du foyer *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={household.name}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsible_firstname">Prénom responsable</Label>
                  <Input
                    id="responsible_firstname"
                    name="responsible_firstname"
                    defaultValue={household.responsible_firstname || ''}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="responsible_lastname">Nom responsable</Label>
                  <Input
                    id="responsible_lastname"
                    name="responsible_lastname"
                    defaultValue={household.responsible_lastname || ''}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={household.email || ''}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={household.phone || ''}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address_line1">Adresse ligne 1</Label>
                <Input
                  id="address_line1"
                  name="address_line1"
                  defaultValue={household.address_line1 || ''}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="address_line2">Adresse ligne 2</Label>
                <Input
                  id="address_line2"
                  name="address_line2"
                  defaultValue={household.address_line2 || ''}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    defaultValue={household.postal_code || ''}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={household.city || ''}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes internes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={household.notes || ''}
                  disabled={loading}
                />
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
                <Link href="/households">
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
