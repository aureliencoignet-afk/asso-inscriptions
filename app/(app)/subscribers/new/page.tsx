'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSubscriber } from '@/lib/actions/subscribers'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewSubscriberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [households, setHouseholds] = useState<any[]>([])

  useEffect(() => {
    // Charger la liste des foyers
    fetch('/api/households')
      .then(res => res.json())
      .then(data => setHouseholds(data))
      .catch(err => console.error(err))
  }, [])

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
      await createSubscriber(data)
      router.push('/subscribers')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'abonné')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Nouvel abonné</h1>
          <p className="text-muted-foreground mt-2">
            Créez un nouvel abonné
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'abonné</CardTitle>
          <CardDescription>
            Renseignez les informations personnelles de l'abonné
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
                    placeholder="Jean"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastname">Nom *</Label>
                  <Input
                    id="lastname"
                    name="lastname"
                    placeholder="Dupont"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="household_id">Foyer (optionnel)</Label>
                <select
                  id="household_id"
                  name="household_id"
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
                <p className="text-xs text-muted-foreground mt-1">
                  Si vous n'avez pas encore créé de foyer, vous pourrez le faire plus tard
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <select
                    id="gender"
                    name="gender"
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
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer l\'abonné'}
              </Button>
              <Link href="/subscribers">
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
