import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default async function RegistrationsPage() {
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

      <Card>
        <CardHeader>
          <CardTitle>Module en développement</CardTitle>
          <CardDescription>
            Le module d'inscription complet sera disponible dans une prochaine version
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Fonctionnalités prévues</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Wizard de création d'inscription (abonné, cotisation, activités)</li>
                <li>• Configuration de l'échéancier (1x ou 3x)</li>
                <li>• Saisie des modalités de paiement (chèques, liquide, etc.)</li>
                <li>• Liste et recherche des inscriptions</li>
                <li>• Modification et annulation d'inscriptions</li>
                <li>• Génération de récapitulatifs PDF</li>
              </ul>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Pour l'instant, vous pouvez:</h3>
              <div className="space-y-3">
                <Link href="/import">
                  <div className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Importer des inscriptions</p>
                      <p className="text-sm text-muted-foreground">
                        Utilisez l'import Excel pour créer des inscriptions en masse
                      </p>
                    </div>
                  </div>
                </Link>
                
                <div className="p-3 bg-white border rounded-lg opacity-50">
                  <p className="text-sm text-muted-foreground">
                    💡 Ou créez manuellement les inscriptions via SQL Editor dans Supabase en attendant l'interface
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Note:</strong> Les données d'inscription sont fonctionnelles dans la base de données. 
                Seule l'interface utilisateur de création/modification est en cours de développement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
