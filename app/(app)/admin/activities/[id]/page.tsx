'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateActivity, deleteActivity } from '@/lib/actions/activities'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activity, setActivity] = useState<any>(null)
  const [seasons, setSeasons] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      import('@/lib/actions/activities').then(({ getActivityById }) => getActivityById(params.id)),
      import('@/lib/actions/seasons').then(({ getSeasons }) => getSeasons())
    ])
      .then(([activityData, seasonsData]) => {
        setActivity(activityData)
        setSeasons(seasonsData)
      })
      .catch(err => setError('Erreur de chargement'))
  }, [params.id])

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
      await updateActivity(params.id, data)
      router.push('/admin/activities')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return
    
    try {
      await deleteActivity(params.id)
      router.push('/admin/activities')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  if (!activity) {
    return <div className="flex items-center justify-center py-12">Chargement...</div>
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
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'activité</h1>
          <p className="text-muted-foreground mt-2">
            {activity.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'activité</CardTitle>
          <CardDescription>
            Modifiez les détails de l'activité
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
                  defaultValue={activity.name}
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
                  defaultValue={activity.description || ''}
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
                    defaultValue={activity.base_price}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    defaultValue={activity.capacity || ''}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="season_id">Saison</Label>
                <select
                  id="season_id"
                  name="season_id"
                  defaultValue={activity.season_id || ''}
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
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={activity.is_active}
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

            <div className="flex justify-between">
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Link href="/admin/activities">
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
