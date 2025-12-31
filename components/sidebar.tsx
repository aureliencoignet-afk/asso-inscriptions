'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  UserCircle, 
  ClipboardList, 
  Upload, 
  Download, 
  Settings, 
  LogOut, 
  Calendar,
  Activity,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'
import type { Profile } from '@/types/database'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Foyers', href: '/households', icon: Users },
  { name: 'Abonnés', href: '/subscribers', icon: UserCircle },
  { name: 'Inscriptions', href: '/registrations', icon: ClipboardList },
  { name: 'Import', href: '/import', icon: Upload },
  { name: 'Exports', href: '/exports', icon: Download },
]

const adminNavigation = [
  { name: 'Saisons', href: '/admin/seasons', icon: Calendar },
  { name: 'Activités', href: '/admin/activities', icon: Activity },
  { name: 'Utilisateurs', href: '/admin/users', icon: ShieldCheck },
]

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">Inscriptions</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          {/* Main navigation */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Admin section */}
          {profile.role === 'admin' && (
            <div>
              <div className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </div>
              <div className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href)
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Settings - available to all */}
          <div>
            <div className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Système
            </div>
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Settings className="h-5 w-5" />
              Paramètres
            </Link>
          </div>
        </nav>
      </div>
      
      <div className="border-t p-4">
        <div className="mb-4 rounded-lg bg-white p-3 text-sm">
          <p className="font-medium">{profile.first_name} {profile.last_name}</p>
          <p className="text-xs text-gray-500">{profile.email}</p>
          <p className="mt-1 text-xs">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {profile.role === 'admin' ? 'Admin' : 
               profile.role === 'gestionnaire' ? 'Gestionnaire' : 'Lecture'}
            </span>
          </p>
        </div>
        
        <form action={signOut}>
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </form>
      </div>
    </div>
  )
}
