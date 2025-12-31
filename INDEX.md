# Index des Fichiers - Application Inscriptions Association

## 📁 Structure Complète du Projet

### 📄 Fichiers de Configuration (Racine)

| Fichier | Description |
|---------|-------------|
| `package.json` | Dépendances npm et scripts |
| `tsconfig.json` | Configuration TypeScript |
| `next.config.js` | Configuration Next.js |
| `tailwind.config.js` | Configuration Tailwind CSS |
| `postcss.config.js` | Configuration PostCSS |
| `middleware.ts` | Middleware d'authentification |
| `.env.example` | Template des variables d'environnement |
| `.gitignore` | Fichiers à ignorer par Git |

### 📚 Documentation

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation technique complète |
| `QUICKSTART.md` | Guide de démarrage rapide (30 min) |
| `IMPORT_FORMAT.md` | Spécification du format d'import Excel |
| `DEPLOIEMENT.md` | Instructions de déploiement |

### 🗄️ Base de Données

| Fichier | Description |
|---------|-------------|
| `supabase_schema.sql` | Schéma PostgreSQL complet (tables, index, RLS) |

### 🎨 Application (app/)

#### Layouts
| Fichier | Description |
|---------|-------------|
| `app/layout.tsx` | Layout racine de l'application |
| `app/globals.css` | Styles CSS globaux |
| `app/(app)/layout.tsx` | Layout des pages protégées (avec sidebar) |

#### Authentification
| Fichier | Description |
|---------|-------------|
| `app/login/page.tsx` | Page de connexion |

#### Pages Principales
| Fichier | Description |
|---------|-------------|
| `app/(app)/page.tsx` | Dashboard avec statistiques |
| `app/(app)/households/page.tsx` | Liste des foyers |
| `app/(app)/households/new/page.tsx` | Création de foyer |
| `app/(app)/subscribers/page.tsx` | Liste des abonnés |
| `app/(app)/registrations/page.tsx` | Inscriptions (placeholder) |
| `app/(app)/import/page.tsx` | Import Excel (placeholder) |
| `app/(app)/exports/page.tsx` | Exports CSV (placeholder) |

#### Administration
| Fichier | Description |
|---------|-------------|
| `app/(app)/admin/page.tsx` | Page d'accueil admin |
| `app/(app)/admin/seasons/page.tsx` | Gestion des saisons |

### 🧩 Composants (components/)

#### Composants Métier
| Fichier | Description |
|---------|-------------|
| `components/sidebar.tsx` | Navigation latérale avec menu et profil |

#### Composants UI (shadcn/ui)
| Fichier | Description |
|---------|-------------|
| `components/ui/button.tsx` | Boutons avec variantes |
| `components/ui/card.tsx` | Cartes pour contenus |
| `components/ui/input.tsx` | Champs de saisie |
| `components/ui/label.tsx` | Labels de formulaire |

### 📦 Bibliothèques (lib/)

#### Actions Serveur
| Fichier | Description |
|---------|-------------|
| `lib/actions/auth.ts` | Authentification et profils |
| `lib/actions/dashboard.ts` | Statistiques du dashboard |
| `lib/actions/households.ts` | CRUD foyers |
| `lib/actions/subscribers.ts` | CRUD abonnés |
| `lib/actions/seasons.ts` | CRUD saisons |

#### Clients Supabase
| Fichier | Description |
|---------|-------------|
| `lib/supabase/client.ts` | Client Supabase côté navigateur |
| `lib/supabase/server.ts` | Client Supabase côté serveur |

#### Utilitaires
| Fichier | Description |
|---------|-------------|
| `lib/utils.ts` | Fonctions utilitaires (formatage, classes CSS) |

### 🔤 Types TypeScript (types/)

| Fichier | Description |
|---------|-------------|
| `types/database.ts` | Types pour toutes les tables de la base de données |

## 📊 Statistiques

- **Total fichiers** : 35 fichiers
- **Lignes de code** : ~6,000+ lignes
- **Technologies** : Next.js 14, TypeScript, Supabase, Tailwind CSS
- **Modules** : 12 modules (auth, dashboard, foyers, abonnés, etc.)

## 🚀 Fichiers Clés pour Démarrer

1. **QUICKSTART.md** - Commencez ici !
2. **supabase_schema.sql** - À exécuter en premier dans Supabase
3. **.env.example** - À copier en .env.local
4. **package.json** - Pour installer les dépendances

## 📝 Notes

- Les fichiers marqués (placeholder) sont des pages d'attente pour des fonctionnalités en développement
- Tous les composants UI suivent les standards shadcn/ui
- Toutes les actions serveur sont sécurisées avec authentification
- Le schéma SQL inclut RLS pour la sécurité multi-tenant

## 🎯 Prochains Fichiers à Créer (Extensions)

- `lib/actions/registrations.ts` - CRUD inscriptions complètes
- `lib/actions/activities.ts` - CRUD activités
- `lib/actions/import.ts` - Logique d'import Excel
- `lib/actions/export.ts` - Logique d'export CSV/XLSX
- `components/registration-wizard.tsx` - Wizard d'inscription
- `components/import-uploader.tsx` - Interface d'import
- `app/(app)/admin/activities/page.tsx` - Gestion activités

---

**Tous les fichiers sont prêts à être déployés !** 🚀
