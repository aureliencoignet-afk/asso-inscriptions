import { getRegistrations } from '@/lib/actions/registrations'
import { getSeasons } from '@/lib/actions/seasons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, ClipboardList, Search } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: { season?: string; status?: string }
}) {
  const registrations = await getRegistrations({
    seasonId: searchParams.season,
    status: searchParams.status,
  })
  const seasons = await getSeasons()

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
      style: styles[status as keyof typeof styles] || styles.draft, 
      label: labels[status as keyof typeof labels] || status 
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les inscriptions des abonnés
          </p>
        </div>
        <Link href="/registrations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle inscription
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form method="get" className="flex gap-4">
            <div className="flex-1">
              <select
                name="season"
                defaultValue={searchParams.season || ''}
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
            <div className="flex-1">
              <select
                name="status"
                defaultValue={searchParams.status || ''}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="validated">Validée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      {registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune inscription</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par créer votre première inscription
            </p>
            <Link href="/registrations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer une inscription
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {registrations.map((registration) => {
            const badge = getStatusBadge(registration.status)
            const cotisationLine = registration.lines?.find(l => l.line_type === 'COTISATION')
            const activityLines = registration.lines?.filter(l => l.line_type === 'ACTIVITE') || []
            
            return (
              <Link key={registration.id} href={`/registrations/${registration.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {registration.subscriber?.firstname} {registration.subscriber?.lastname}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.style}`}>
                            {badge.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">N° Inscription</p>
                            <p className="font-medium">{registration.registration_number}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Saison</p>
                            <p className="font-medium">{registration.season?.label}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date d'inscription</p>
                            <p className="font-medium">{formatDate(registration.registration_date)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Échéances</p>
                            <p className="font-medium">{registration.installments?.length || 0} paiement(s)</p>
                          </div>
                        </div>

                        {activityLines.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1">Activités :</p>
                            <div className="flex flex-wrap gap-2">
                              {activityLines.map((line) => (
                                <span key={line.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  {line.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(registration.total_net)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Montant total
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
