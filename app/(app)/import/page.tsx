'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download, FileCheck } from 'lucide-react'
import { importInscriptions, validateImportData, type ImportRow } from '@/lib/actions/imports'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<ImportRow[]>([])
  const [validationResult, setValidationResult] = useState<any>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'validate' | 'import' | 'result'>('upload')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setLoading(true)

    try {
      const text = await selectedFile.text()
      const rows = text.split('\n').map(line => {
        // Simple CSV parser (utilise point-virgule ou virgule)
        const values = line.split(/[;,]/).map(v => v.trim().replace(/^"|"$/g, ''))
        return values
      })

      // Extraire les headers
      const headers = rows[0].map(h => h.toLowerCase().replace(/ /g, '_'))
      
      // Convertir en objets
      const parsed: ImportRow[] = rows.slice(1)
        .filter(row => row.some(cell => cell)) // Ignorer lignes vides
        .map(row => {
          const obj: any = {}
          headers.forEach((header, index) => {
            const value = row[index]
            // Convertir les nombres
            if (header.includes('montant') || header.includes('nb')) {
              obj[header] = value ? parseFloat(value.replace(',', '.')) : undefined
            } else {
              obj[header] = value || undefined
            }
          })
          return obj
        })

      setData(parsed)
      setStep('preview')
    } catch (error: any) {
      alert('Erreur lors de la lecture du fichier: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleValidate() {
    setLoading(true)
    try {
      const result = await validateImportData(data)
      setValidationResult(result)
      setStep('validate')
    } catch (error: any) {
      alert('Erreur de validation: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleImport() {
    setLoading(true)
    try {
      const result = await importInscriptions(data)
      setImportResult(result)
      setStep('result')
    } catch (error: any) {
      alert('Erreur d\'import: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function downloadTemplate() {
    const template = `foyer_nom;responsable_email;responsable_telephone;adresse;abonne_nom;abonne_prenom;abonne_date_naissance;abonne_email;abonne_telephone;saison;cotisation_montant;activite_1;montant_activite_1;activite_2;montant_activite_2;activite_3;montant_activite_3;echeancier_nb;echeance1_date;echeance1_montant;echeance1_mode;echeance2_date;echeance2_montant;echeance2_mode;echeance3_date;echeance3_montant;echeance3_mode
Famille Martin;martin@example.com;0601020304;1 rue de la Paix;Martin;Jean;2010-05-15;jean.martin@example.com;0601020304;2024-2025;50;Tennis;150;Natation;120;;;3;2024-09-01;106.67;CHEQUE;2024-10-01;106.67;CHEQUE;2024-11-01;106.66;CHEQUE
Famille Dupont;dupont@example.com;0601020305;2 rue de la Paix;Dupont;Marie;2012-03-20;marie.dupont@example.com;0601020305;2024-2025;50;Danse;200;;;2;2024-09-15;125;VIREMENT;2024-10-15;125;VIREMENT`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'template_import_inscriptions.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Excel/CSV</h1>
        <p className="text-muted-foreground mt-2">
          Importez vos inscriptions en masse via fichier CSV ou Excel
        </p>
      </div>

      {/* Étape 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>1. Choisir un fichier</CardTitle>
            <CardDescription>
              Fichier CSV ou Excel (.csv, .xlsx) avec les colonnes requises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">
                  {loading ? 'Chargement...' : 'Cliquez pour choisir un fichier'}
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV ou Excel • Max 10 MB
                </p>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Besoin d'un modèle ?
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Téléchargez notre fichier modèle avec des exemples de données
              </p>
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Télécharger le modèle CSV
              </Button>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Colonnes requises :</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="bg-white p-2 rounded border">
                  <span className="font-medium text-primary">abonne_nom</span>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="font-medium text-primary">abonne_prenom</span>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="font-medium text-primary">saison</span>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="font-medium text-primary">cotisation_montant</span>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="font-medium text-primary">echeancier_nb</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Toutes les autres colonnes sont optionnelles
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 2: Prévisualisation */}
      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>2. Prévisualisation</CardTitle>
            <CardDescription>
              {data.length} ligne(s) détectée(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Abonné</th>
                    <th className="text-left p-2">Saison</th>
                    <th className="text-left p-2">Cotisation</th>
                    <th className="text-left p-2">Activités</th>
                    <th className="text-left p-2">Échéances</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2 font-medium">
                        {row.abonne_prenom} {row.abonne_nom}
                      </td>
                      <td className="p-2">{row.saison}</td>
                      <td className="p-2">{row.cotisation_montant}€</td>
                      <td className="p-2 text-xs">
                        {[row.activite_1, row.activite_2, row.activite_3]
                          .filter(Boolean)
                          .join(', ')}
                      </td>
                      <td className="p-2">{row.echeancier_nb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  ... et {data.length - 10} autres lignes
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep('upload')} variant="outline">
                Choisir un autre fichier
              </Button>
              <Button onClick={handleValidate} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validation...
                  </>
                ) : (
                  <>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Valider les données
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3: Validation */}
      {step === 'validate' && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle>3. Validation</CardTitle>
            <CardDescription>
              {validationResult.valid 
                ? 'Données valides, prêtes pour l\'import' 
                : 'Certaines données nécessitent des corrections'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.valid ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Validation réussie</h3>
                    <p className="text-sm text-green-800">
                      Toutes les données sont conformes. Vous pouvez lancer l'import.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">
                      {validationResult.errors.length} erreur(s) trouvée(s)
                    </h3>
                    <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                      {validationResult.errors.map((error: string, index: number) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      {validationResult.warnings.length} avertissement(s)
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1 max-h-40 overflow-y-auto">
                      {validationResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setStep('preview')} variant="outline">
                Retour
              </Button>
              {validationResult.valid && (
                <Button onClick={handleImport} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Lancer l'import
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 4: Résultat */}
      {step === 'result' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle>4. Résultat de l'import</CardTitle>
            <CardDescription>
              {importResult.success 
                ? 'Import terminé avec succès' 
                : 'Import terminé avec quelques erreurs'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">{importResult.created}</p>
                  <p className="text-sm text-green-800">Inscriptions créées</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-900">{importResult.errors.length}</p>
                  <p className="text-sm text-red-800">Erreurs</p>
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Détail des erreurs :</h3>
                <ul className="text-sm text-red-800 space-y-1 max-h-60 overflow-y-auto">
                  {importResult.errors.map((error: any, index: number) => (
                    <li key={index}>• Ligne {error.row}: {error.error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-50 border rounded-lg p-4 max-h-60 overflow-y-auto">
              <h3 className="font-semibold mb-2">Journal d'import :</h3>
              <ul className="text-xs text-muted-foreground space-y-1 font-mono">
                {importResult.details.map((detail: string, index: number) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => {
                setStep('upload')
                setFile(null)
                setData([])
                setValidationResult(null)
                setImportResult(null)
              }} variant="outline">
                Nouvel import
              </Button>
              <Button onClick={() => window.location.href = '/registrations'}>
                Voir les inscriptions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
