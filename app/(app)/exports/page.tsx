'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, FileSpreadsheet, Loader2, Calendar, CheckCircle2, AlertCircle, Receipt, TrendingUp, FileText } from 'lucide-react'
import { 
  exportCheques, 
  exportEcheances, 
  exportRetards, 
  exportInscriptions,
  exportTresorerie,
  convertToCSV,
  type ExportType,
  type ExportFilters
} from '@/lib/actions/exports'
import { getSeasons } from '@/lib/actions/seasons'
import { getActivities } from '@/lib/actions/activities'

export default function ExportsPage() {
  const [loading, setLoading] = useState(false)
  const [exportType, setExportType] = useState<ExportType>('cheques')
  const [seasons, setSeasons] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  
  const [filters, setFilters] = useState<ExportFilters>({
    season_id: '',
    date_debut: '',
    date_fin: '',
    payment_mode: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [seasonsData, activitiesData] = await Promise.all([
          getSeasons(),
          getActivities()
        ])
        setSeasons(seasonsData)
        setActivities(activitiesData)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  const exportTypes = [
    {
      value: 'cheques',
      label: 'Chèques à encaisser',
      description: 'Liste des chèques reçus et prévus',
      icon: Receipt,
      color: 'text-green-600'
    },
    {
      value: 'echeances',
      label: 'Échéances à venir',
      description: '30 prochains jours par défaut',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      value: 'retards',
      label: 'Paiements en retard',
      description: 'Échéances dépassées non réglées',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      value: 'inscriptions',
      label: 'État des inscriptions',
      description: 'Liste complète avec statuts',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      value: 'tresorerie',
      label: 'Suivi trésorerie',
      description: 'Tous les paiements avec dates',
      icon: TrendingUp,
      color: 'text-orange-600'
    },
  ]

  async function handleExport() {
    setLoading(true)
    try {
      let data: any[] = []
      let filename = ''

      // Nettoyer les filtres (supprimer les valeurs vides)
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) acc[key as keyof ExportFilters] = value
        return acc
      }, {} as ExportFilters)

      switch (exportType) {
        case 'cheques':
          data = await exportCheques(cleanFilters)
          filename = 'cheques_a_encaisser'
          break
        case 'echeances':
          data = await exportEcheances(cleanFilters)
          filename = 'echeances_a_venir'
          break
        case 'retards':
          data = await exportRetards(cleanFilters)
          filename = 'paiements_en_retard'
          break
        case 'inscriptions':
          data = await exportInscriptions(cleanFilters)
          filename = 'etat_inscriptions'
          break
        case 'tresorerie':
          data = await exportTresorerie(cleanFilters)
          filename = 'suivi_tresorerie'
          break
      }

      if (data.length === 0) {
        alert('Aucune donnée à exporter avec ces filtres')
        return
      }

      // Convertir en CSV
      const csv = convertToCSV(data, filename)
      
      // Créer le fichier et déclencher le téléchargement
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error: any) {
      console.error('Export error:', error)
      alert(error.message || 'Erreur lors de l\'export')
    } finally {
      setLoading(false)
    }
  }

  const selectedExport = exportTypes.find(t => t.value === exportType)
  const Icon = selectedExport?.icon || FileSpreadsheet

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exports</h1>
        <p className="text-muted-foreground mt-2">
          Générez des exports pour la trésorerie et le suivi des paiements
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Type d'export */}
        <Card>
          <CardHeader>
            <CardTitle>Type d'export</CardTitle>
            <CardDescription>
              Sélectionnez le type de données à exporter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exportTypes.map((type) => {
              const TypeIcon = type.icon
              const isSelected = exportType === type.value
              
              return (
                <div
                  key={type.value}
                  onClick={() => setExportType(type.value as ExportType)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${isSelected ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      <TypeIcon className={`h-5 w-5 ${isSelected ? 'text-primary' : type.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isSelected ? 'text-primary' : ''}`}>
                        {type.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>
              Affinez votre export (optionnel)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Saison */}
            <div className="space-y-2">
              <Label>Saison</Label>
              <Select
                value={filters.season_id}
                onValueChange={(value) => setFilters({ ...filters, season_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les saisons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les saisons</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name} ({season.start_date} - {season.end_date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            {(exportType === 'echeances' || exportType === 'retards' || exportType === 'tresorerie') && (
              <>
                <div className="space-y-2">
                  <Label>Date début</Label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filters.date_debut}
                    onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date fin</Label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={filters.date_fin}
                    onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Mode de paiement */}
            {exportType === 'tresorerie' && (
              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select
                  value={filters.payment_mode}
                  onValueChange={(value) => setFilters({ ...filters, payment_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les modes</SelectItem>
                    <SelectItem value="CHEQUE">Chèque</SelectItem>
                    <SelectItem value="VIREMENT">Virement</SelectItem>
                    <SelectItem value="ESPECES">Espèces</SelectItem>
                    <SelectItem value="CB">Carte bancaire</SelectItem>
                    <SelectItem value="PRELEVEMENT">Prélèvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Activité */}
            {exportType === 'inscriptions' && (
              <div className="space-y-2">
                <Label>Activité</Label>
                <Select
                  value={filters.activity_id}
                  onValueChange={(value) => setFilters({ ...filters, activity_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les activités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les activités</SelectItem>
                    {activities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                onClick={handleExport}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger CSV
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={selectedExport?.color} />
            {selectedExport?.label}
          </CardTitle>
          <CardDescription>
            {selectedExport?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Format de sortie</h3>
              <p className="text-sm text-blue-800">
                Fichier CSV compatible Excel avec encodage UTF-8. Les données peuvent être 
                directement ouvertes dans Excel, LibreOffice Calc ou Google Sheets.
              </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Colonnes exportées :</h3>
              <div className="text-sm text-muted-foreground font-mono">
                {exportType === 'cheques' && 'Date échéance | Date réception | Montant | Foyer | Abonné | N° Inscription | Activités | N° Chèque | Banque | Statut | Notes'}
                {exportType === 'echeances' && 'Date échéance | Montant | Foyer | Abonné | N° Inscription | Saison | Activités | Modes paiement | Statut'}
                {exportType === 'retards' && 'Date échéance | Jours retard | Montant | Foyer | Abonné | Email | Téléphone | N° Inscription | Saison | Activités | Modes paiement'}
                {exportType === 'inscriptions' && 'N° Inscription | Date | Statut | Foyer | Abonné | Email | Téléphone | Saison | Activités | Cotisation | Total activités | Montant total | Montant payé | Reste à payer | Nb échéances | Nb payées'}
                {exportType === 'tresorerie' && 'Date échéance | Date réception | Date encaissement | Montant | Mode | N° Chèque | Banque | N° Transaction | Statut | Abonné | N° Inscription | Saison'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
