'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createActivity } from '@/lib/actions/activities'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewActivityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [seasons, setSeasons] = useState<any[]>([])

  useEffect(() => {
    import('@/lib/actions/seasons').then(({ getSeasons }) => {
      getSeasons()
        .then(data => setSeasons(data))
        .catch(err => console.error(err))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const seasonId = formData.get('season_id') as string
    const capacity = formData.get('capacity') as string
    
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      base_price: parseFloat(formData.get('base_price') as string),
      season_id: seasonId || undefined,
      capacity: capacity ? parseInt(capacity) : undefined,
      is_active: formData.get('is_active') === 'on',
    }

    try {
      await createActivity(data)
      router.push('/admin/activities')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'activité')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/activities">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle activité</h1>
          <p className="text-muted-foreground mt-2">
            Créez une nouvelle activité pour votre association
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'activité</CardTitle>
          <CardDescription>
            Renseignez les détails de l'activité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'activité *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Football, Danse, Tennis..."
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Description de l'activité..."
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">Prix de base (€) *</Label>
                  <Input
                    id="base_price"
                    name="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="200.00"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacité (optionnel)</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    placeholder="20"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="season_id">Saison (optionnel)</Label>
                <select
                  id="season_id"
                  name="season_id"
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Toutes les saisons</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Si vide, l'activité sera disponible pour toutes les saisons
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Activité active
                </Label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer l\'activité'}
              </Button>
              <Link href="/admin/activities">
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
