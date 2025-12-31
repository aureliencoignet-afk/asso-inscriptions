import { getUsers } from '@/lib/actions/users'
import { requireRole } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Users, ShieldCheck, Eye, Settings } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function UsersPage() {
  await requireRole('admin')
  const users = await getUsers()

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      gestionnaire: 'bg-blue-100 text-blue-800',
      lecture: 'bg-gray-100 text-gray-800',
    }
    const icons = {
      admin: ShieldCheck,
      gestionnaire: Settings,
      lecture: Eye,
    }
    const labels = {
      admin: 'Administrateur',
      gestionnaire: 'Gestionnaire',
      lecture: 'Lecture seule',
    }
    const Icon = icons[role as keyof typeof icons] || Eye
    return { 
      style: styles[role as keyof typeof styles] || styles.lecture, 
      label: labels[role as keyof typeof labels] || role,
      Icon
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les accès et permissions des utilisateurs
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administrateurs</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gestionnaires</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'gestionnaire').length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun utilisateur</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre premier utilisateur
            </p>
            <Link href="/admin/users/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un utilisateur
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const badge = getRoleBadge(user.role)
            const Icon = badge.Icon
            
            return (
              <Link key={user.id} href={`/admin/users/${user.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${badge.style}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold">
                              {user.first_name} {user.last_name}
                            </h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.style}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Créé le {formatDate(user.created_at)}
                          </p>
                        </div>
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
