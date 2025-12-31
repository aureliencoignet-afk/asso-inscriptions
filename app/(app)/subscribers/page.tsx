import { getSubscribers } from '@/lib/actions/subscribers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function SubscribersPage() {
  const subscribers = await getSubscribers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Abonnés</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les abonnés de votre association
          </p>
        </div>
        <Link href="/subscribers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel abonné
          </Button>
        </Link>
      </div>

      {subscribers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun abonné</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par créer votre premier abonné
            </p>
            <Link href="/subscribers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un abonné
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium">Nom</th>
                <th className="text-left p-4 font-medium">Prénom</th>
                <th className="text-left p-4 font-medium">Date de naissance</th>
                <th className="text-left p-4 font-medium">Foyer</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{subscriber.lastname}</td>
                  <td className="p-4">{subscriber.firstname}</td>
                  <td className="p-4">
                    {subscriber.date_of_birth 
                      ? formatDate(subscriber.date_of_birth)
                      : '-'
                    }
                  </td>
                  <td className="p-4">
                    {subscriber.household?.name || '-'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {subscriber.email || '-'}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/subscribers/${subscriber.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
