'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createHousehold } from '@/lib/actions/households'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewHouseholdPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      await createHousehold(data)
      router.push('/households')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du foyer')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Nouveau foyer</h1>
          <p className="text-muted-foreground mt-2">
            Créez un nouveau foyer pour regrouper des abonnés
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du foyer</CardTitle>
          <CardDescription>
            Renseignez les informations du foyer et du responsable
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
                  placeholder="Ex: Famille Dupont"
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
                    placeholder="Jean"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="responsible_lastname">Nom responsable</Label>
                  <Input
                    id="responsible_lastname"
                    name="responsible_lastname"
                    placeholder="Dupont"
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
                    placeholder="jean.dupont@exemple.fr"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address_line1">Adresse ligne 1</Label>
                <Input
                  id="address_line1"
                  name="address_line1"
                  placeholder="123 rue de la République"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="address_line2">Adresse ligne 2</Label>
                <Input
                  id="address_line2"
                  name="address_line2"
                  placeholder="Appartement 4B"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    placeholder="75001"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Paris"
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
                  placeholder="Notes internes..."
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer le foyer'}
              </Button>
              <Link href="/households">
                <Button type="button" variant="outline" disabled={loading}>
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
