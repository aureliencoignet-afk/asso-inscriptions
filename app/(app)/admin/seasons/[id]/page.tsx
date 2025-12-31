'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSeason, deleteSeason } from '@/lib/actions/seasons'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function SeasonDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [season, setSeason] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/seasons/${params.id}`)
      .then(res => res.json())
      .then(data => setSeason(data))
      .catch(err => setError('Erreur de chargement'))
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      label: formData.get('label') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      status: formData.get('status') as 'draft' | 'open' | 'closed',
    }

    try {
      await updateSeason(params.id, data)
      router.push('/admin/seasons')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette saison ?')) return
    
    try {
      await deleteSeason(params.id)
      router.push('/admin/seasons')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  if (!season) {
    return <div className="flex items-center justify-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/seasons">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier la saison</h1>
          <p className="text-muted-foreground mt-2">
            {season.label}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la saison</CardTitle>
          <CardDescription>
            Modifiez les détails de la saison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="label">Libellé *</Label>
                <Input
                  id="label"
                  name="label"
                  defaultValue={season.label}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Date de début *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={season.start_date}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Date de fin *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    defaultValue={season.end_date}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Statut *</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={season.status}
                  required
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="draft">Brouillon</option>
                  <option value="open">Ouverte</option>
                  <option value="closed">Fermée</option>
                </select>
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
                <Link href="/admin/seasons">
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
