import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileSpreadsheet } from 'lucide-react'

export default async function ExportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exports</h1>
        <p className="text-muted-foreground mt-2">
          Générez des exports pour la trésorerie et le suivi des paiements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module en développement</CardTitle>
          <CardDescription>
            Le module d'export sera disponible dans une prochaine version
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Types d'exports prévus</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Chèques à encaisser</strong> - Par période, banque, montant</li>
                <li>• <strong>Échéances à venir</strong> - 30 prochains jours, par mode</li>
                <li>• <strong>Paiements en retard</strong> - Échéances dépassées non réglées</li>
                <li>• <strong>État des inscriptions</strong> - Liste complète avec statuts</li>
                <li>• <strong>Suivi trésorerie</strong> - Attendu vs Encaissé par période</li>
                <li>• <strong>Export comptable</strong> - Format adapté à votre logiciel</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Formats disponibles</h3>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    CSV (Excel compatible)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    XLSX natif (V2)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    PDF (V2)
                  </li>
                </ul>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Filtres disponibles</h3>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Par saison</li>
                  <li>• Par période (dates)</li>
                  <li>• Par mode de paiement</li>
                  <li>• Par statut (prévu/reçu/encaissé)</li>
                  <li>• Par activité</li>
                  <li>• Par foyer/abonné</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Exemple de colonnes - Export "Chèques":</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                <div className="whitespace-nowrap">
                  Date | Montant | Foyer | Abonné | N° Inscription | Activités | N° Chèque | Banque | Statut
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Alternative temporaire:</strong> Vous pouvez utiliser le Table Editor 
                de Supabase pour exporter manuellement les données des tables 
                <code className="bg-yellow-100 px-1 rounded">installments</code> et 
                <code className="bg-yellow-100 px-1 rounded">planned_payments</code>.
              </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Requête SQL pour export manuel:</h3>
              <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`SELECT 
  i.due_date as date_echeance,
  pp.amount as montant,
  h.name as foyer,
  s.firstname || ' ' || s.lastname as abonne,
  r.registration_number as num_inscription,
  pp.payment_mode as mode,
  pp.check_number as num_cheque,
  pp.bank_name as banque,
  pp.status as statut
FROM planned_payments pp
JOIN installments i ON i.id = pp.installment_id
JOIN registrations r ON r.id = i.registration_id
JOIN subscribers s ON s.id = r.subscriber_id
LEFT JOIN households h ON h.id = s.household_id
WHERE r.association_id = 'VOTRE_ASSO_ID'
  AND pp.payment_mode = 'CHEQUE'
  AND i.status = 'planned'
ORDER BY i.due_date;`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
