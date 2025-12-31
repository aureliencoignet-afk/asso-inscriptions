# 📊 Fonctionnalités Import/Export

## ✅ Fonctionnalités Implémentées

Les modules d'import et d'export sont maintenant **complètement fonctionnels** ! 🎉

---

## 📤 EXPORTS

### Types d'Exports Disponibles

#### 1. **Chèques à encaisser** 💰
Liste des chèques reçus et prévus avec toutes les informations nécessaires.

**Colonnes exportées** :
- Date échéance
- Date réception
- Montant
- Foyer
- Abonné
- N° Inscription
- Activités
- N° Chèque
- Banque
- Statut
- Notes

#### 2. **Échéances à venir** 📅
Liste des échéances des 30 prochains jours (personnalisable).

**Colonnes exportées** :
- Date échéance
- Montant
- Foyer
- Abonné
- N° Inscription
- Saison
- Activités
- Modes paiement
- Statut

#### 3. **Paiements en retard** ⚠️
Liste des échéances dépassées non réglées avec coordonnées pour relance.

**Colonnes exportées** :
- Date échéance
- Jours de retard
- Montant
- Foyer
- Abonné
- Email
- Téléphone
- N° Inscription
- Saison
- Activités
- Modes paiement

#### 4. **État des inscriptions** 📋
Vue complète de toutes les inscriptions avec statuts et montants.

**Colonnes exportées** :
- N° Inscription
- Date inscription
- Statut
- Foyer
- Abonné
- Email
- Téléphone
- Saison
- Activités
- Cotisation
- Total activités
- Montant total
- Montant payé
- Reste à payer
- Nb échéances
- Nb échéances payées

#### 5. **Suivi trésorerie** 💳
Tous les paiements avec dates de réception et encaissement.

**Colonnes exportées** :
- Date échéance
- Date réception
- Date encaissement
- Montant
- Mode de paiement
- N° Chèque
- Banque
- N° Transaction
- Statut
- Abonné
- N° Inscription
- Saison

### Filtres Disponibles

- **Saison** : Filtrer par une saison spécifique
- **Période** : Dates de début et fin personnalisables
- **Mode de paiement** : Chèque, Virement, Espèces, CB, Prélèvement
- **Activité** : Filtrer par activité (pour export inscriptions)

### Format de Sortie

- **Format** : CSV (compatible Excel)
- **Encodage** : UTF-8
- **Séparateur** : Virgule
- **Ouverture** : Excel, LibreOffice Calc, Google Sheets

---

## 📥 IMPORTS

### Processus d'Import en 4 Étapes

#### Étape 1 : **Upload du fichier**
- Formats acceptés : CSV, XLSX
- Taille max : 10 MB
- Upload par glisser-déposer ou sélection

#### Étape 2 : **Prévisualisation**
- Affichage des 10 premières lignes
- Vérification visuelle des données
- Possibilité de changer de fichier

#### Étape 3 : **Validation**
- Vérification automatique des données
- Détection des erreurs (champs manquants, saisons introuvables, etc.)
- Affichage des avertissements (activités non trouvées)
- Import autorisé uniquement si validation réussie

#### Étape 4 : **Import et Rapport**
- Import ligne par ligne
- Création automatique des foyers, abonnés, inscriptions
- Journal détaillé de l'import
- Rapport final avec nombre de créations et d'erreurs

### Colonnes du Fichier d'Import

#### **Colonnes OBLIGATOIRES** ⚠️
- `abonne_nom` : Nom de famille de l'abonné
- `abonne_prenom` : Prénom de l'abonné
- `saison` : Nom de la saison (doit exister dans la base)
- `cotisation_montant` : Montant de la cotisation (nombre)
- `echeancier_nb` : Nombre d'échéances (1, 2, 3, etc.)

#### **Colonnes OPTIONNELLES - Foyer**
- `foyer_nom` : Nom du foyer
- `responsable_email` : Email du responsable
- `responsable_telephone` : Téléphone du responsable
- `adresse` : Adresse du foyer

#### **Colonnes OPTIONNELLES - Abonné**
- `abonne_date_naissance` : Date de naissance (format YYYY-MM-DD)
- `abonne_email` : Email de l'abonné
- `abonne_telephone` : Téléphone de l'abonné

#### **Colonnes OPTIONNELLES - Activités** (jusqu'à 3)
- `activite_1` : Nom de l'activité 1 (doit exister)
- `montant_activite_1` : Montant de l'activité 1
- `activite_2` : Nom de l'activité 2
- `montant_activite_2` : Montant de l'activité 2
- `activite_3` : Nom de l'activité 3
- `montant_activite_3` : Montant de l'activité 3

#### **Colonnes OPTIONNELLES - Échéancier** (jusqu'à 3)
- `echeance1_date` : Date de l'échéance 1 (format YYYY-MM-DD)
- `echeance1_montant` : Montant de l'échéance 1 (si non précisé : total/nb)
- `echeance1_mode` : Mode de paiement (CHEQUE, VIREMENT, ESPECES, CB, PRELEVEMENT)
- `echeance2_date`, `echeance2_montant`, `echeance2_mode`
- `echeance3_date`, `echeance3_montant`, `echeance3_mode`

### Fichier Modèle

Un fichier **modèle CSV** avec des exemples est téléchargeable directement depuis la page d'import.

**Exemple de ligne** :
```csv
foyer_nom;responsable_email;abonne_nom;abonne_prenom;saison;cotisation_montant;activite_1;montant_activite_1;echeancier_nb;echeance1_date;echeance1_mode
Famille Martin;martin@example.com;Martin;Jean;2024-2025;50;Tennis;150;3;2024-09-01;CHEQUE
```

### Règles de Gestion

#### **Foyers**
- Si le foyer existe déjà (même nom) → Réutilisé
- Sinon → Créé automatiquement

#### **Abonnés**
- Si l'abonné existe déjà (même prénom + nom) → Réutilisé
- Sinon → Créé automatiquement

#### **Inscriptions**
- Toujours créées (même si abonné existant)
- Génération automatique du numéro d'inscription

#### **Activités**
- Doivent exister dans la base de données
- Si introuvable → Avertissement, ligne d'activité ignorée

#### **Échéancier**
- Si dates non précisées → Générées mensuellement automatiquement
- Si montants non précisés → Total divisé équitablement
- Si modes non précisés → CHEQUE par défaut

### Validation Automatique

Avant l'import, le système vérifie :
- ✅ Présence des champs obligatoires
- ✅ Validité des montants (positifs)
- ✅ Existence des saisons
- ✅ Existence des activités (warning si absent)
- ✅ Cohérence de l'échéancier

---

## 🚀 Utilisation

### Export

1. Allez sur **Exports** dans le menu
2. Sélectionnez le **type d'export** désiré
3. Appliquez les **filtres** (optionnel)
4. Cliquez sur **Télécharger CSV**
5. Le fichier est téléchargé automatiquement

### Import

1. Allez sur **Import Excel** dans le menu
2. Téléchargez le **modèle CSV** (première fois)
3. Remplissez le fichier avec vos données
4. **Uploadez** le fichier rempli
5. Vérifiez la **prévisualisation**
6. Lancez la **validation**
7. Si validation OK → Lancez l'**import**
8. Consultez le **rapport détaillé**

---

## 📁 Fichiers Créés

### Actions
- `lib/actions/exports.ts` - Fonctions d'export
- `lib/actions/imports.ts` - Fonctions d'import et validation

### Pages
- `app/(app)/exports/page.tsx` - Interface d'export
- `app/(app)/import/page.tsx` - Interface d'import

---

## ⚠️ Points d'Attention

### Exports
- Les exports peuvent prendre quelques secondes pour les gros volumes
- Le fichier CSV utilise l'encodage UTF-8 (compatible Excel moderne)
- Si Excel n'affiche pas correctement les accents : "Données" > "À partir du texte" > UTF-8

### Imports
- **Vérifiez toujours** le résultat de validation avant import
- Les erreurs de validation bloquent l'import
- Les avertissements permettent l'import mais certaines données seront ignorées
- **Testez d'abord** avec un petit fichier (2-3 lignes)
- L'import est **irréversible** (pas de rollback global)

---

## 🎯 Cas d'Usage

### Export Chèques
**Objectif** : Préparer le dépôt en banque  
**Filtre** : Statut "Reçu", période du mois  
**Action** : Pointer les chèques déposés dans la banque

### Export Retards
**Objectif** : Relancer les familles  
**Filtre** : Toutes les échéances dépassées  
**Action** : Envoi d'emails de relance avec email et téléphone

### Export Trésorerie
**Objectif** : Bilan comptable  
**Filtre** : Toute la saison, tous les modes  
**Action** : Import dans le logiciel comptable

### Import Initial
**Objectif** : Migration depuis ancien système  
**Méthode** : Export des données de l'ancien système en CSV  
**Action** : Import en masse dans la nouvelle application

---

## ✅ Avantages

### Exports
- ✅ **Rapide** : Génération instantanée
- ✅ **Flexible** : Nombreux filtres disponibles
- ✅ **Compatible** : CSV universel
- ✅ **Complet** : Toutes les informations nécessaires

### Imports
- ✅ **Guidé** : Processus en 4 étapes clair
- ✅ **Sécurisé** : Validation avant import
- ✅ **Détaillé** : Rapport ligne par ligne
- ✅ **Intelligent** : Création automatique des entités

---

## 🔮 Évolutions Futures (V2)

- [ ] Export Excel natif (XLSX) avec formules
- [ ] Export PDF avec mise en forme
- [ ] Import Excel natif (XLSX)
- [ ] Mapping de colonnes personnalisable
- [ ] Templates d'import sauvegardés
- [ ] Import incrémental (mise à jour)
- [ ] Planification d'exports automatiques
- [ ] Historique des imports

---

**Les fonctionnalités Import/Export sont maintenant opérationnelles ! 🎉**
