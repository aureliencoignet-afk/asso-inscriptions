import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'

export default async function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Excel</h1>
        <p className="text-muted-foreground mt-2">
          Importez vos inscriptions en masse via fichier Excel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module en développement</CardTitle>
          <CardDescription>
            Le module d'import sera disponible dans une prochaine version
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Fonctionnalités prévues</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload de fichier Excel (.xlsx) ou CSV</li>
                <li>• Mapping assisté des colonnes</li>
                <li>• Prévisualisation des données</li>
                <li>• Validation et détection d'erreurs</li>
                <li>• Import par lots avec rapport détaillé</li>
                <li>• Support de l'upsert (création/mise à jour)</li>
              </ul>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Format Excel attendu
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Consultez la documentation complète du format d'import:
              </p>
              <Link href="/IMPORT_FORMAT.md" target="_blank">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-sm font-medium">IMPORT_FORMAT.md</span>
                </div>
              </Link>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Colonnes principales requises:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-primary">Foyer</p>
                  <p className="text-xs text-muted-foreground">foyer_nom, responsable_email</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-primary">Abonné</p>
                  <p className="text-xs text-muted-foreground">abonne_nom, abonne_prenom</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-primary">Inscription</p>
                  <p className="text-xs text-muted-foreground">saison, cotisation_montant</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-primary">Échéancier</p>
                  <p className="text-xs text-muted-foreground">echeancier_nb, echeance1_date</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Alternative temporaire:</strong> En attendant l'interface d'import, 
                vous pouvez utiliser l'interface Supabase pour insérer des données directement 
                via le Table Editor ou SQL Editor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
