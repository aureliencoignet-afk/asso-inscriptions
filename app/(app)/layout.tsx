import { requireAuth } from '@/lib/actions/auth'
import { Sidebar } from '@/components/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
