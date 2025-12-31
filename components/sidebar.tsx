'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, UserCircle, ClipboardList, Upload, Download, Settings, LogOut } from 'lucide-react'
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
  { name: 'Administration', href: '/admin', icon: Settings, adminOnly: true },
]

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || profile.role === 'admin'
  )

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">Inscriptions</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
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
        </nav>
      </div>
      
      <div className="border-t p-4">
        <div className="mb-4 rounded-lg bg-white p-3 text-sm">
          <p className="font-medium">{profile.display_name}</p>
          <p className="text-xs text-gray-500">{profile.email}</p>
          <p className="mt-1 text-xs">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {profile.role}
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
