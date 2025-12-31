import { getActivities } from '@/lib/actions/activities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Tag } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { requireRole } from '@/lib/actions/auth'

export default async function ActivitiesAdminPage() {
  await requireRole('admin')
  const activities = await getActivities()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activités</h1>
          <p className="text-muted-foreground mt-2">
            Gérez le catalogue des activités proposées
          </p>
        </div>
        <Link href="/admin/activities/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle activité
          </Button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune activité</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre première activité pour commencer
            </p>
            <Link href="/admin/activities/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer une activité
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Card key={activity.id} className={!activity.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    {activity.name}
                  </span>
                  {!activity.is_active && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {activity.description && (
                  <p className="text-muted-foreground">{activity.description}</p>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Prix de base</span>
                  <span className="font-bold text-lg">{formatCurrency(activity.base_price)}</span>
                </div>
                {activity.capacity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacité</span>
                    <span>{activity.capacity} places</span>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <Link href={`/admin/activities/${activity.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Modifier
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
