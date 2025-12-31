import { getHouseholds } from '@/lib/actions/households'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function HouseholdsPage() {
  const households = await getHouseholds()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foyers</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les foyers et leurs membres
          </p>
        </div>
        <Link href="/households/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau foyer
          </Button>
        </Link>
      </div>

      {households.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun foyer</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par créer votre premier foyer
            </p>
            <Link href="/households/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un foyer
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {households.map((household) => (
            <Link key={household.id} href={`/households/${household.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {household.name}
                  </CardTitle>
                  {(household.responsible_firstname || household.responsible_lastname) && (
                    <CardDescription>
                      {household.responsible_firstname} {household.responsible_lastname}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {household.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{household.email}</span>
                    </div>
                  )}
                  {household.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{household.phone}</span>
                    </div>
                  )}
                  {household.city && (
                    <div className="text-muted-foreground">
                      {household.city}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Créé le {formatDate(household.created_at)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
