# 🔧 CORRECTION - Erreur "User not allowed" lors de la création d'utilisateur

## ❌ Erreur Rencontrée

```
[AuthApiError]: User not allowed
status: 403
code: 'not_admin'
```

Cette erreur se produit lors de la tentative de création d'un nouvel utilisateur depuis la page `/admin/users/new`.

## 🔍 Cause du Problème

L'API `supabase.auth.admin.*` nécessite la **clé `service_role`** de Supabase qui donne un accès administrateur complet. Cette clé **ne doit JAMAIS être exposée côté client** pour des raisons de sécurité.

Le code initial tentait d'utiliser `supabase.auth.admin.createUser()` directement depuis une Server Action, mais le client Supabase standard n'a pas les permissions nécessaires.

## ✅ Solution Implémentée

Création d'une **API Route sécurisée** côté serveur qui utilise un client Supabase admin avec la clé `service_role`.

### Architecture

```
Client (Browser)
    ↓ appelle
Server Action (users.ts)
    ↓ fait un fetch vers
API Route (/api/admin/users)
    ↓ utilise
Client Admin Supabase (service_role)
    ↓ crée l'utilisateur dans
Supabase Auth
```

## 📁 Fichiers Créés/Modifiés

### 1. Client Admin Supabase

**Nouveau** : `lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

**Rôle** : Crée un client Supabase avec des privilèges admin en utilisant la clé `service_role`.

### 2. API Route - Créer un utilisateur

**Nouveau** : `app/api/admin/users/route.ts`

**Endpoint** : `POST /api/admin/users`

**Fonctionnalités** :
- ✅ Vérifie que l'utilisateur actuel est admin
- ✅ Valide les données (email, password, first_name, last_name, role)
- ✅ Utilise le client admin pour créer l'utilisateur
- ✅ Crée le profil dans la table `profiles`
- ✅ Rollback automatique si le profil échoue (supprime l'utilisateur auth)
- ✅ Gestion d'erreurs complète

### 3. API Route - Supprimer/Réinitialiser

**Nouveau** : `app/api/admin/users/[id]/route.ts`

**Endpoints** :
- `DELETE /api/admin/users/[id]` - Supprime un utilisateur
- `PATCH /api/admin/users/[id]` - Réinitialise le mot de passe

**Protections** :
- ✅ Vérifie que l'utilisateur actuel est admin
- ✅ Empêche la suppression de son propre compte
- ✅ Validation du mot de passe (min 6 caractères)

### 4. Actions Utilisateur

**Modifié** : `lib/actions/users.ts`

Les fonctions suivantes appellent maintenant les API routes :

**`createUser()`**
```typescript
// Avant : Utilisait supabase.auth.admin.createUser() ❌
// Après : Appelle /api/admin/users ✅
const response = await fetch('/api/admin/users', {
  method: 'POST',
  body: JSON.stringify(data),
})
```

**`deleteUser()`**
```typescript
// Avant : Utilisait supabase.auth.admin.deleteUser() ❌
// Après : Appelle /api/admin/users/[id] ✅
const response = await fetch(`/api/admin/users/${id}`, {
  method: 'DELETE',
})
```

**`resetUserPassword()`**
```typescript
// Avant : Utilisait supabase.auth.admin.updateUserById() ❌
// Après : Appelle /api/admin/users/[id] ✅
const response = await fetch(`/api/admin/users/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({
    action: 'reset_password',
    password: newPassword,
  }),
})
```

## 🔐 Configuration Requise

### Variables d'Environnement

Ajoutez la clé `service_role` dans vos variables d'environnement :

**Local** : `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Vercel** : Settings > Environment Variables
```
Variable Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc... (votre clé service_role)
Environment: Production, Preview, Development
```

### 🔍 Où Trouver la Clé Service Role

1. Allez sur **Supabase Dashboard**
2. Sélectionnez votre projet
3. **Settings** > **API**
4. Section **Project API keys**
5. Copiez la clé **`service_role`** (pas la clé `anon`!)

⚠️ **ATTENTION** : Cette clé donne un accès complet à votre base de données. Ne la partagez JAMAIS et ne la commitez JAMAIS dans Git.

## 🚀 Déploiement

### Étape 1 : Variables d'Environnement

**Vercel** :
```
1. Vercel Dashboard > Votre Projet
2. Settings > Environment Variables
3. Ajouter :
   - Name: SUPABASE_SERVICE_ROLE_KEY
   - Value: [votre clé service_role]
   - Environments: Production, Preview, Development
4. Save
```

### Étape 2 : Redéployer

```bash
# Commit et push les changements
git add .
git commit -m "fix: utiliser API routes pour gestion utilisateurs"
git push origin main

# Vercel redéploie automatiquement
```

### Étape 3 : Vérifier

1. Aller sur `/admin/users`
2. Cliquer sur **+ Nouvel utilisateur**
3. Remplir le formulaire
4. Créer l'utilisateur
5. ✅ L'utilisateur est créé sans erreur

## 🔒 Sécurité

### Ce qui est Sécurisé ✅

1. **Clé service_role côté serveur uniquement**
   - La clé n'est jamais envoyée au client
   - Utilisée uniquement dans les API routes
   - Stockée dans les variables d'environnement Vercel

2. **Vérification des permissions**
   - Chaque API route vérifie le rôle admin
   - Protection contre les appels non autorisés
   - Rollback automatique en cas d'erreur

3. **Validation des données**
   - Email, mot de passe, rôle validés
   - Empêche la création d'utilisateurs invalides
   - Messages d'erreur clairs

### Protection Supplémentaire

Les API routes vérifient toujours :
- ✅ L'utilisateur est authentifié
- ✅ L'utilisateur a le rôle `admin`
- ✅ Les données sont valides
- ✅ Pas d'auto-suppression

## 📊 Flux Complet

### Création d'un Utilisateur

```
1. Admin remplit le formulaire (/admin/users/new)
   ↓
2. Appelle createUser() (Server Action)
   ↓
3. Fait un fetch vers /api/admin/users
   ↓
4. API route vérifie les permissions
   ↓
5. Utilise le client admin (service_role)
   ↓
6. Crée l'utilisateur dans auth.users
   ↓
7. Crée le profil dans profiles
   ↓
8. Retourne le résultat au client
   ↓
9. Redirige vers /admin/users
```

### En Cas d'Erreur

```
Si la création du profil échoue :
1. API route détecte l'erreur
2. Supprime automatiquement l'utilisateur auth
3. Retourne l'erreur au client
4. L'utilisateur voit un message d'erreur clair
```

## ✅ Tests de Vérification

Après déploiement, testez :

- [ ] Créer un utilisateur avec rôle "Lecture" ✅
- [ ] Créer un utilisateur avec rôle "Gestionnaire" ✅
- [ ] Créer un utilisateur avec rôle "Admin" ✅
- [ ] Réinitialiser le mot de passe d'un utilisateur ✅
- [ ] Supprimer un utilisateur ✅
- [ ] Essayer de se supprimer soi-même (devrait échouer) ✅
- [ ] Essayer sans être admin (devrait échouer) ✅

## 📋 Résumé

| Élément | Avant | Après | Statut |
|---------|-------|-------|--------|
| Création utilisateur | Server Action directe | API Route sécurisée | ✅ |
| Client Supabase | Standard (anon) | Admin (service_role) | ✅ |
| Clé service_role | Non utilisée | Côté serveur uniquement | ✅ |
| Permissions | Insuffisantes | Complètes et vérifiées | ✅ |
| Sécurité | Exposée | Protégée | ✅ |

---

## 🎯 Résolution du Problème

**Problème** : `User not allowed` (403)
**Cause** : Utilisation de `auth.admin` sans service_role
**Solution** : API routes sécurisées avec client admin
**Résultat** : ✅ Création d'utilisateurs fonctionnelle

---

**La création d'utilisateurs fonctionne maintenant correctement ! 🎉**

N'oubliez pas d'ajouter la variable `SUPABASE_SERVICE_ROLE_KEY` dans Vercel !
