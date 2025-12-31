# 👥 Gestion des Utilisateurs et Paramètres

## ✅ Nouvelles Fonctionnalités Ajoutées

### 1. 👤 Gestion des Utilisateurs (Admin uniquement)

**Page** : `/admin/users`

#### Fonctionnalités :

**Liste des utilisateurs**
- ✅ Affichage de tous les utilisateurs de l'association
- ✅ Statistiques : Total, Admins, Gestionnaires
- ✅ Cartes avec informations complètes :
  - Nom, Prénom
  - Email
  - Rôle (badge coloré avec icône)
  - Date de création

**Création d'utilisateur** (`/admin/users/new`)
- ✅ Formulaire complet :
  - Prénom, Nom
  - Email
  - Mot de passe (minimum 6 caractères)
  - Rôle (Lecture / Gestionnaire / Admin)
- ✅ Validation des données
- ✅ Création du compte auth + profil
- ✅ Gestion des erreurs

**Modification d'utilisateur** (`/admin/users/[id]`)
- ✅ Informations système (ID, date création)
- ✅ Modification du profil :
  - Prénom, Nom
  - Rôle
- ✅ Réinitialisation du mot de passe
- ✅ Suppression de l'utilisateur
- ✅ Protections :
  - Ne peut pas modifier son propre rôle
  - Ne peut pas se supprimer soi-même

#### Rôles et Permissions

**Lecture seule**
- ✅ Consulter uniquement
- ❌ Pas de création/modification

**Gestionnaire**
- ✅ Créer, modifier tous les contenus
- ❌ Pas d'accès aux paramètres admin

**Administrateur**
- ✅ Tous les droits
- ✅ Gestion des utilisateurs
- ✅ Accès aux paramètres

---

### 2. ⚙️ Paramètres de l'Association

**Page** : `/settings` (accessible à tous)

#### Sections :

**Informations générales**
- ✅ Nom de l'association
- ✅ Email de contact
- ✅ Téléphone
- ✅ Adresse complète
- ✅ Code postal + Ville

**Paramètres par défaut**
- ✅ Montant par défaut de la cotisation
- ✅ Utilisé lors de la création d'inscriptions

**Informations système**
- ✅ ID de l'association
- ✅ Date de création

#### Permissions
- **Consultation** : Tous les rôles
- **Modification** : Admin uniquement

---

## 📁 Fichiers Créés (8 fichiers)

### Actions (2 fichiers)
1. `lib/actions/users.ts` - Gestion des utilisateurs
2. `lib/actions/settings.ts` - Paramètres association

### Pages Users (3 fichiers)
3. `app/(app)/admin/users/page.tsx` - Liste
4. `app/(app)/admin/users/new/page.tsx` - Création
5. `app/(app)/admin/users/[id]/page.tsx` - Détail/Modification

### Page Settings (1 fichier)
6. `app/(app)/settings/page.tsx` - Paramètres

### Composants (1 fichier)
7. `components/sidebar.tsx` - Sidebar mise à jour

### Documentation (1 fichier)
8. `MODULE_USERS_SETTINGS.md` - Ce fichier

---

## 🎨 Navigation Mise à Jour

### Sidebar Hiérarchique

```
📊 Dashboard
👨‍👩‍👧 Foyers
👤 Abonnés
📋 Inscriptions
⬆️ Import
⬇️ Exports

─────────────────────────
ADMINISTRATION (admin only)
📅 Saisons
🏃 Activités
🛡️ Utilisateurs         ← NOUVEAU

─────────────────────────
SYSTÈME
⚙️ Paramètres           ← NOUVEAU
```

### Accès par Rôle

| Page | Lecture | Gestionnaire | Admin |
|------|---------|--------------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Foyers | ✅ | ✅ | ✅ |
| Abonnés | ✅ | ✅ | ✅ |
| Inscriptions | ✅ | ✅ | ✅ |
| Saisons | ❌ | ❌ | ✅ |
| Activités | ❌ | ❌ | ✅ |
| **Utilisateurs** | ❌ | ❌ | ✅ |
| **Paramètres (lecture)** | ✅ | ✅ | ✅ |
| **Paramètres (modif)** | ❌ | ❌ | ✅ |

---

## 🔐 Sécurité

### Contrôles d'Accès

**Gestion des Utilisateurs**
```typescript
// Page accessible uniquement aux admins
await requireRole('admin')

// Ne peut pas modifier son propre rôle
if (id === profile.id && data.role) {
  throw new Error('Vous ne pouvez pas modifier votre propre rôle')
}

// Ne peut pas se supprimer soi-même
if (id === profile.id) {
  throw new Error('Vous ne pouvez pas supprimer votre propre compte')
}
```

**Paramètres**
```typescript
// Consultation : tous les rôles
const settings = await getAssociationSettings()

// Modification : admin uniquement
if (profile.role !== 'admin') {
  throw new Error('Permission admin requise')
}
```

### Création de Compte

Le processus de création est **transactionnel** :

1. Création du compte auth Supabase
2. Création du profil dans la table `profiles`
3. Si échec profil → Suppression du compte auth (rollback)

---

## 🎯 Cas d'Usage

### Scénario 1 : Ajouter un Gestionnaire

```
1. Admin > Utilisateurs > + Nouvel utilisateur

2. Remplir le formulaire :
   - Prénom : Marie
   - Nom : Dupont
   - Email : marie.dupont@example.com
   - Mot de passe : MotDePasse123
   - Rôle : Gestionnaire

3. Cliquer sur "Créer l'utilisateur"

4. Marie peut maintenant se connecter et :
   ✅ Créer/modifier des foyers, abonnés, inscriptions
   ❌ Ne peut pas accéder aux paramètres admin
```

### Scénario 2 : Modifier le Profil

```
1. Admin > Utilisateurs > Cliquer sur Marie Dupont

2. Modifier les informations :
   - Changer le prénom : Marie → Marie-Claire
   - Changer le rôle : Gestionnaire → Admin

3. Enregistrer

4. Marie-Claire a maintenant les droits admin
```

### Scénario 3 : Réinitialiser le Mot de Passe

```
1. Admin > Utilisateurs > Marie Dupont

2. Section "Réinitialiser le mot de passe"

3. Cliquer sur "Réinitialiser le mot de passe"

4. Saisir le nouveau mot de passe

5. Confirmer

6. Marie peut se reconnecter avec le nouveau mot de passe
```

### Scénario 4 : Configurer l'Association

```
1. N'importe quel utilisateur > Paramètres

2. Voir les informations actuelles

3. Admin uniquement : Modifier
   - Nom : Mon Association
   - Email : contact@association.fr
   - Téléphone : 01 23 45 67 89
   - Adresse : 123 rue Example
   - Code postal : 75001
   - Ville : Paris
   - Cotisation par défaut : 50€

4. Enregistrer

5. Ces informations seront utilisées partout dans l'app
```

---

## 📊 Structure des Tables

### Table `profiles`
```sql
- id (UUID, PK)
- email (TEXT)
- first_name (TEXT)
- last_name (TEXT)
- role (TEXT) -- admin, gestionnaire, lecture
- association_id (UUID, FK)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table `associations`
```sql
- id (UUID, PK)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- address (TEXT)
- city (TEXT)
- postal_code (TEXT)
- default_cotisation_amount (NUMERIC)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## ✨ Résumé

**Module Utilisateurs :**
- ✅ Liste complète avec statistiques
- ✅ Création avec rôles
- ✅ Modification profil
- ✅ Réinitialisation mot de passe
- ✅ Suppression sécurisée
- ✅ Protections multiples

**Module Paramètres :**
- ✅ Informations générales
- ✅ Coordonnées contact
- ✅ Paramètres par défaut
- ✅ Consultation pour tous
- ✅ Modification admin uniquement

**Navigation :**
- ✅ Sidebar hiérarchique
- ✅ Section Administration
- ✅ Section Système
- ✅ Badges de rôle
- ✅ Responsive

---

## 🚀 Déploiement

Ces nouvelles pages sont **prêtes à l'emploi** :
- ✅ Sécurité RLS active
- ✅ Contrôles d'accès par rôle
- ✅ Validations des données
- ✅ Gestion des erreurs
- ✅ Interface intuitive

**Bon déploiement ! 🎉**
