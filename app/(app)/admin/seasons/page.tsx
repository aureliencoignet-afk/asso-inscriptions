import { getSeasons } from '@/lib/actions/seasons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { requireRole } from '@/lib/actions/auth'

export default async function SeasonsAdminPage() {
  await requireRole('admin')
  const seasons = await getSeasons()

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
    }
    const labels = {
      draft: 'Brouillon',
      open: 'Ouverte',
      closed: 'Fermée',
    }
    return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saisons</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les saisons de votre association
          </p>
        </div>
        <Link href="/admin/seasons/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle saison
          </Button>
        </Link>
      </div>

      {seasons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune saison</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre première saison pour commencer
            </p>
            <Link href="/admin/seasons/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer une saison
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seasons.map((season) => {
            const badge = getStatusBadge(season.status)
            return (
              <Card key={season.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {season.label}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.style}`}>
                      {badge.label}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Début</span>
                    <span className="font-medium">{formatDate(season.start_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fin</span>
                    <span className="font-medium">{formatDate(season.end_date)}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <Link href={`/admin/seasons/${season.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Gérer
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
