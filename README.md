# Gestion Inscriptions Association

Application web complète de gestion des inscriptions pour associations, développée avec **Next.js 14**, **Supabase** (PostgreSQL + Auth + RLS), et déployable sur **Vercel**.

## 📋 Fonctionnalités

### ✅ MVP Implémenté

- **Authentification** : Connexion sécurisée avec Supabase Auth
- **Gestion des rôles** : Admin, Gestionnaire, Lecture seule (RLS)
- **Dashboard** : Statistiques en temps réel (inscriptions, montants, échéances)
- **Foyers** : Création et gestion des foyers (familles)
- **Abonnés** : Gestion des abonnés avec lien aux foyers
- **Saisons** : Configuration des saisons sportives/associatives
- **Activités** : Catalogue des activités proposées
- **Inscriptions** : Gestion complète avec cotisation + activités
- **Échéancier** : Paiements en 1x ou 3x avec modalités (chèque, liquide, etc.)
- **Exports** : Exports CSV des paiements (chèques, échéances, etc.)
- **Import Excel** : Import en masse des inscriptions
- **Sécurité** : Row Level Security (RLS) pour isolation multi-tenant

### 🚀 Extensions possibles (V2)

- Export XLSX (Excel)
- Import multi-onglets avancé
- Suivi encaissement détaillé
- Notifications automatiques (échéances en retard)
- Génération PDF (fiches d'inscription)
- Rapports et analytics avancés

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router) + TypeScript
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **UI** : Tailwind CSS + shadcn/ui (Radix UI)
- **Formulaires** : React Hook Form + Zod
- **Déploiement** : Vercel
- **Import/Export** : xlsx, exceljs

## 📦 Installation et Configuration

### 1. Prérequis

- Node.js 18+ et npm/yarn
- Compte Supabase (gratuit)
- Compte Vercel (gratuit)
- Compte GitHub

### 2. Configuration Supabase

#### A. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `Project URL` et `anon key`

#### B. Exécuter le schéma SQL

1. Dans le Dashboard Supabase, allez dans **SQL Editor**
2. Copiez tout le contenu du fichier `supabase_schema.sql`
3. Collez et exécutez le script
4. Vérifiez que toutes les tables sont créées (associations, profiles, seasons, households, subscribers, etc.)

#### C. Créer votre première association et utilisateur

```sql
-- Créer une association
INSERT INTO associations (name, email, currency) 
VALUES ('Mon Association', 'contact@monasso.fr', 'EUR')
RETURNING id; -- Notez cet ID

-- Créer un utilisateur (via Supabase Auth Dashboard ou SQL)
-- Allez dans Authentication > Users > Invite User
-- Email: admin@monasso.fr

-- Créer le profil admin (remplacez les UUIDs)
INSERT INTO profiles (id, association_id, role, display_name, email, is_active)
VALUES (
  'USER_UUID_FROM_AUTH', -- UUID de l'utilisateur créé
  'ASSOCIATION_UUID',     -- UUID de l'association
  'admin',
  'Administrateur',
  'admin@monasso.fr',
  true
);
```

### 3. Configuration locale

```bash
# Cloner le projet
git clone <votre-repo>
cd asso-inscriptions

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Éditer .env.local avec vos clés Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
# SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (optionnel)
```

### 4. Lancer en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

### 5. Déploiement sur Vercel

#### Option A : Via GitHub (Recommandé)

1. Créez un repo GitHub et pushez le code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <votre-repo-url>
git push -u origin main
```

2. Sur [vercel.com](https://vercel.com):
   - Import Project
   - Sélectionnez votre repo
   - Ajoutez les variables d'environnement:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (optionnel)
   - Deploy!

#### Option B : Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
# Suivez les instructions et ajoutez vos variables d'environnement
```

## 📝 Utilisation

### Premier démarrage

1. **Connexion** : Utilisez l'email et mot de passe de votre utilisateur admin créé
2. **Configuration** :
   - Allez dans **Administration** > **Saisons**
   - Créez votre première saison (ex: "2024-2025")
   - Allez dans **Administration** > **Activités**
   - Créez vos activités (ex: "Football", "Danse", etc.)

3. **Création d'inscriptions** :
   - Créez un foyer dans **Foyers**
   - Ajoutez un abonné dans **Abonnés** (liez-le au foyer)
   - Créez une inscription pour cet abonné
   - Ajoutez cotisation + activités
   - Configurez l'échéancier (1x ou 3x)
   - Saisissez les modalités de paiement

### Import Excel

Format Excel attendu (colonnes minimales):

```
foyer_nom | responsable_email | abonne_nom | abonne_prenom | saison | cotisation_montant | activite_1_nom | activite_1_montant | echeancier_nb | echeance1_date | echeance1_mode
```

Exemple:
```
Famille Dupont | dupont@mail.fr | Dupont | Jean | 2024-2025 | 50 | Football | 200 | 3 | 2024-09-15 | CHEQUE
```

1. Allez dans **Import**
2. Téléversez votre fichier Excel
3. Mappez les colonnes
4. Prévisualisez et validez
5. Consultez le rapport d'import

### Exports

1. Allez dans **Exports**
2. Sélectionnez le type d'export :
   - Échéances à venir
   - Chèques à encaisser
   - Paiements en retard
3. Appliquez les filtres (dates, saison, mode de paiement)
4. Générez et téléchargez le CSV

## 🔒 Sécurité et Bonnes Pratiques

### Row Level Security (RLS)

Toutes les données sont isolées par `association_id`. Un utilisateur ne peut voir que les données de son association. Les politiques RLS sont configurées dans le schéma SQL.

### Rôles et permissions

- **Admin** : Accès complet, gestion utilisateurs, configuration
- **Gestionnaire** : Création/modification des données (foyers, abonnés, inscriptions)
- **Lecture** : Consultation et exports uniquement

### Données sensibles

- **Ne jamais exposer** `SUPABASE_SERVICE_ROLE_KEY` côté client
- Les informations médicales ne sont pas stockées par défaut
- Respectez le RGPD : collectez uniquement les données nécessaires

## 🗂️ Structure du Projet

```
asso-inscriptions/
├── app/
│   ├── (app)/              # Pages protégées
│   │   ├── page.tsx        # Dashboard
│   │   ├── households/     # Foyers
│   │   ├── subscribers/    # Abonnés
│   │   ├── registrations/  # Inscriptions
│   │   ├── import/         # Import
│   │   ├── exports/        # Exports
│   │   └── admin/          # Administration
│   ├── login/              # Page de connexion
│   ├── layout.tsx          # Layout racine
│   └── globals.css         # Styles globaux
├── components/
│   ├── ui/                 # Composants UI (shadcn)
│   └── sidebar.tsx         # Navigation
├── lib/
│   ├── actions/            # Server Actions
│   │   ├── auth.ts
│   │   ├── dashboard.ts
│   │   ├── households.ts
│   │   ├── subscribers.ts
│   │   └── seasons.ts
│   ├── supabase/           # Clients Supabase
│   └── utils.ts            # Utilitaires
├── types/
│   └── database.ts         # Types TypeScript
├── middleware.ts           # Middleware auth
├── supabase_schema.sql     # Schéma PostgreSQL
└── package.json
```

## 🔄 Workflow Git + Vercel

```bash
# Développement local
git checkout -b feature/nouvelle-fonctionnalite
# ... développement ...
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# Vercel déploie automatiquement une preview
# Testez la preview, puis mergez

git checkout main
git merge feature/nouvelle-fonctionnalite
git push origin main

# Vercel déploie automatiquement en production
```

## 📊 Base de données - Tables principales

| Table | Description |
|-------|-------------|
| `associations` | Organisations (multi-tenant) |
| `profiles` | Utilisateurs + rôles |
| `seasons` | Saisons sportives/associatives |
| `households` | Foyers (familles) |
| `subscribers` | Abonnés (personnes) |
| `activities` | Catalogue d'activités |
| `registrations` | Inscriptions (cotisation + activités) |
| `registration_lines` | Lignes d'inscription (cotisation/activités) |
| `installments` | Échéances de paiement |
| `planned_payments` | Modalités de paiement prévues |
| `import_jobs` | Historique des imports |
| `export_jobs` | Historique des exports |

## 🐛 Dépannage

### Problème de connexion

- Vérifiez que l'utilisateur existe dans Supabase Auth
- Vérifiez que le profil existe dans la table `profiles`
- Vérifiez que `association_id` est correct

### RLS bloque l'accès

- Vérifiez que le profil de l'utilisateur a un `association_id` valide
- Vérifiez que les données ont le même `association_id`
- Consultez les logs dans Supabase Dashboard > Logs

### Erreurs de déploiement Vercel

- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez les logs de build dans Vercel Dashboard
- `npm run build` localement pour tester

### Import Excel échoue

- Vérifiez le format des colonnes
- Vérifiez que la saison existe
- Vérifiez que les activités existent
- Consultez le rapport d'import pour les erreurs détaillées

## 📞 Support

Pour toute question ou problème :

1. Consultez cette documentation
2. Vérifiez les issues GitHub (si applicable)
3. Contactez l'équipe technique

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation et de modification.

---

**Développé avec ❤️ pour simplifier la gestion des inscriptions associatives**
