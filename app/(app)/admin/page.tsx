import { requireRole } from '@/lib/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Tag, Users, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  await requireRole('admin')

  const adminSections = [
    {
      title: 'Saisons',
      description: 'Gérer les saisons sportives ou associatives',
      href: '/admin/seasons',
      icon: Calendar,
    },
    {
      title: 'Activités',
      description: 'Gérer le catalogue des activités proposées',
      href: '/admin/activities',
      icon: Tag,
    },
    {
      title: 'Utilisateurs',
      description: 'Gérer les utilisateurs et leurs permissions',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Paramètres',
      description: 'Configuration de l\'association',
      href: '/admin/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground mt-2">
          Gérez la configuration de votre association
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {adminSections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary font-medium">
                    Gérer →
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Informations système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0 MVP</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Base de données</span>
            <span className="font-medium">Supabase PostgreSQL</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Déploiement</span>
            <span className="font-medium">Vercel</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
