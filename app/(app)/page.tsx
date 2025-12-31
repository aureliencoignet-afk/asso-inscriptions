import { getDashboardStats } from '@/lib/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ClipboardList, Euro, TrendingUp, AlertCircle, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Inscriptions validées',
      value: stats.totalRegistrations,
      icon: ClipboardList,
      description: 'Total des inscriptions',
    },
    {
      title: 'Montant attendu',
      value: formatCurrency(stats.totalExpected),
      icon: Euro,
      description: 'Total des inscriptions validées',
    },
    {
      title: 'Montant encaissé',
      value: formatCurrency(stats.totalCashed),
      icon: TrendingUp,
      description: `${((stats.totalCashed / stats.totalExpected) * 100 || 0).toFixed(1)}% du total`,
    },
    {
      title: 'Échéances à venir',
      value: stats.upcomingInstallments,
      icon: Clock,
      description: 'Dans les 30 prochains jours',
    },
    {
      title: 'Échéances en retard',
      value: stats.overdueInstallments,
      icon: AlertCircle,
      description: stats.overdueInstallments > 0 ? 'Nécessite une action' : 'Aucun retard',
      alert: stats.overdueInstallments > 0,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de vos inscriptions et paiements
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className={stat.alert ? 'border-red-200 bg-red-50' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.alert ? 'text-red-600' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs mt-1 ${stat.alert ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/registrations/new"
              className="block p-3 hover:bg-gray-50 rounded-md border transition-colors"
            >
              <p className="font-medium">Nouvelle inscription</p>
              <p className="text-sm text-muted-foreground">
                Créer une inscription pour un abonné
              </p>
            </a>
            <a
              href="/import"
              className="block p-3 hover:bg-gray-50 rounded-md border transition-colors"
            >
              <p className="font-medium">Importer des inscriptions</p>
              <p className="text-sm text-muted-foreground">
                Import en masse via fichier Excel
              </p>
            </a>
            <a
              href="/exports"
              className="block p-3 hover:bg-gray-50 rounded-md border transition-colors"
            >
              <p className="font-medium">Exporter les paiements</p>
              <p className="text-sm text-muted-foreground">
                Générer des exports pour la trésorerie
              </p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Taux d'encaissement</span>
              <span className="font-medium">
                {stats.totalExpected > 0 
                  ? `${((stats.totalCashed / stats.totalExpected) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Reste à encaisser</span>
              <span className="font-medium">
                {formatCurrency(stats.totalExpected - stats.totalCashed)}
              </span>
            </div>
            {stats.overdueInstallments > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                <p className="text-sm text-red-800 font-medium">
                  {stats.overdueInstallments} échéance{stats.overdueInstallments > 1 ? 's' : ''} en retard
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Consultez la liste des paiements pour plus de détails
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
