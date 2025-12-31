# 📁 Structure Complète : app/api

## 🎯 Vue d'Ensemble

Le dossier `app/api` contient **uniquement 2 types d'API routes** :
1. **Gestion des Utilisateurs** (`/admin`) - Nécessite la clé service_role
2. **Génération de PDF** (`/registrations`) - Accessible aux utilisateurs authentifiés

---

## 📂 Structure Complète

```
app/
└── api/
    ├── admin/
    │   └── users/
    │       ├── route.ts                    ← Créer un utilisateur (POST)
    │       └── [id]/
    │           └── route.ts                ← Supprimer/Modifier un utilisateur (DELETE, PATCH)
    └── registrations/
        └── pdf/
            └── route.ts                    ← Générer un PDF (GET)
```

**Total : 3 fichiers API routes**

---

## 📄 Contenu de Chaque Fichier

### 1. `/api/admin/users/route.ts`

**Endpoint** : `POST /api/admin/users`

**Rôle** : Créer un nouvel utilisateur

**Corps de la Requête** :
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "role": "gestionnaire"
}
```

**Fonctionnalités** :
- ✅ Vérifie que l'utilisateur actuel est admin
- ✅ Valide les données (email, password min 6 chars, etc.)
- ✅ Utilise le client admin (service_role)
- ✅ Crée l'utilisateur dans `auth.users`
- ✅ Crée le profil dans `profiles`
- ✅ Rollback automatique si échec du profil

**Dépendances** :
- `createAdminClient()` de `lib/supabase/admin.ts`
- `getProfile()` de `lib/actions/auth.ts`

**Réponse Succès** :
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "gestionnaire"
  }
}
```

**Réponse Erreur** :
```json
{
  "error": "Message d'erreur"
}
```

---

### 2. `/api/admin/users/[id]/route.ts`

**Endpoints** : 
- `DELETE /api/admin/users/[id]` - Supprimer un utilisateur
- `PATCH /api/admin/users/[id]` - Réinitialiser le mot de passe

#### DELETE - Supprimer un Utilisateur

**URL** : `DELETE /api/admin/users/abc-123-def`

**Fonctionnalités** :
- ✅ Vérifie que l'utilisateur actuel est admin
- ✅ Empêche l'auto-suppression
- ✅ Utilise le client admin (service_role)
- ✅ Supprime l'utilisateur de `auth.users`
- ✅ Le profil est supprimé automatiquement (cascade)

**Réponse Succès** :
```json
{
  "success": true
}
```

#### PATCH - Réinitialiser le Mot de Passe

**URL** : `PATCH /api/admin/users/abc-123-def`

**Corps de la Requête** :
```json
{
  "action": "reset_password",
  "password": "NewPassword123"
}
```

**Fonctionnalités** :
- ✅ Vérifie que l'utilisateur actuel est admin
- ✅ Valide le mot de passe (min 6 chars)
- ✅ Utilise le client admin (service_role)
- ✅ Met à jour le mot de passe dans `auth.users`

**Réponse Succès** :
```json
{
  "success": true
}
```

---

### 3. `/api/registrations/pdf/route.ts`

**Endpoint** : `GET /api/registrations/pdf?id=xxx`

**Rôle** : Générer un PDF d'inscription

**Query Params** :
- `id` : UUID de l'inscription

**Fonctionnalités** :
- ✅ Récupère l'inscription complète avec relations
- ✅ Génère un HTML stylisé
- ✅ Retourne un HTML prêt pour impression
- ✅ Auto-print via JavaScript

**Réponse** : Document HTML (Content-Type: text/html)

**Sections du PDF** :
1. En-tête avec numéro et statut
2. Informations de l'abonné
3. Détail de l'inscription (cotisation + activités)
4. Échéancier de paiement
5. Pied de page

---

## 🔐 Sécurité

### API Admin (`/api/admin/*`)

**Protection à TOUS les niveaux** :

1. **Variable d'environnement** :
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   - ⚠️ Sensible - Jamais exposée au client
   - ⚠️ Stockée uniquement dans Vercel
   - ⚠️ Utilisée uniquement côté serveur

2. **Client Admin** (`lib/supabase/admin.ts`) :
   ```typescript
   export function createAdminClient() {
     const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
     // Client avec privilèges admin
   }
   ```

3. **Vérification des Permissions** :
   ```typescript
   const profile = await getProfile()
   if (!profile || profile.role !== 'admin') {
     return NextResponse.json({ error: '...' }, { status: 403 })
   }
   ```

4. **Validation des Données** :
   - Email valide
   - Mot de passe min 6 caractères
   - Rôle valide (admin/gestionnaire/lecture)

### API PDF (`/api/registrations/*`)

**Protection RLS** :
- L'inscription doit appartenir à l'association de l'utilisateur
- Vérification via `getRegistrationById()` qui applique le RLS

---

## 🚫 Ce qui N'Est PAS dans app/api

**AUCUNE API route pour** :
- ❌ Foyers (utilise Server Actions directement)
- ❌ Abonnés (utilise Server Actions directement)
- ❌ Saisons (utilise Server Actions directement)
- ❌ Activités (utilise Server Actions directement)
- ❌ Inscriptions CRUD (utilise Server Actions directement)

**Pourquoi ?**
- Les Server Actions sont plus performantes
- Pas besoin d'API routes intermédiaires
- Meilleure intégration avec Next.js 14
- Typage TypeScript complet

**Exceptions** :
- Gestion utilisateurs → Nécessite client admin (service_role)
- Génération PDF → Nécessite query params et retour HTML

---

## 📊 Tableau Récapitulatif

| Fichier | Méthode | Endpoint | Rôle | Authentification |
|---------|---------|----------|------|------------------|
| `admin/users/route.ts` | POST | `/api/admin/users` | Créer utilisateur | Admin + service_role |
| `admin/users/[id]/route.ts` | DELETE | `/api/admin/users/[id]` | Supprimer utilisateur | Admin + service_role |
| `admin/users/[id]/route.ts` | PATCH | `/api/admin/users/[id]` | Reset password | Admin + service_role |
| `registrations/pdf/route.ts` | GET | `/api/registrations/pdf?id=xxx` | Générer PDF | Authentifié + RLS |

---

## 🔄 Flux de Données

### Création d'un Utilisateur

```
1. Formulaire (/admin/users/new)
   ↓ submit
2. createUser() (lib/actions/users.ts)
   ↓ fetch POST
3. /api/admin/users (route.ts)
   ↓ vérifie permissions
4. createAdminClient() (lib/supabase/admin.ts)
   ↓ utilise SUPABASE_SERVICE_ROLE_KEY
5. Supabase Auth API
   ↓ crée dans auth.users
6. Supabase Database
   ↓ crée dans profiles
7. Retour à l'utilisateur
   ✅ Succès ou ❌ Erreur
```

### Suppression d'un Utilisateur

```
1. Page détail utilisateur (/admin/users/[id])
   ↓ click delete + confirm
2. deleteUser() (lib/actions/users.ts)
   ↓ fetch DELETE
3. /api/admin/users/[id] (route.ts)
   ↓ vérifie permissions + pas d'auto-suppression
4. createAdminClient()
   ↓ utilise service_role
5. Supabase Auth API
   ↓ supprime de auth.users
6. Trigger CASCADE
   ↓ supprime automatiquement de profiles
7. Retour à l'utilisateur
   ✅ Succès
```

### Génération PDF

```
1. Page détail inscription (/registrations/[id])
   ↓ click "Télécharger PDF"
2. window.open('/api/registrations/pdf?id=xxx')
   ↓ requête GET
3. /api/registrations/pdf (route.ts)
   ↓ getRegistrationById() avec RLS
4. Supabase Database
   ↓ récupère inscription + relations
5. Génération HTML
   ↓ format A4, styles CSS
6. Retour HTML
   ↓ Content-Type: text/html
7. Navigateur
   ✅ Affiche et auto-print
```

---

## 🧪 Tests de Vérification

### Test 1 : Créer un Utilisateur

```bash
curl -X POST https://your-app.vercel.app/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "first_name": "Test",
    "last_name": "User",
    "role": "lecture"
  }'
```

**Attendu** :
```json
{
  "success": true,
  "user": { "id": "...", "email": "test@example.com", ... }
}
```

### Test 2 : Supprimer un Utilisateur

```bash
curl -X DELETE https://your-app.vercel.app/api/admin/users/abc-123 \
  -H "Content-Type: application/json"
```

**Attendu** :
```json
{
  "success": true
}
```

### Test 3 : Générer un PDF

```
https://your-app.vercel.app/api/registrations/pdf?id=abc-123
```

**Attendu** : Document HTML s'affiche et s'imprime

---

## ✅ Checklist Finale

Votre dossier `app/api` doit contenir :

- [ ] `admin/users/route.ts` (POST)
- [ ] `admin/users/[id]/route.ts` (DELETE, PATCH)
- [ ] `registrations/pdf/route.ts` (GET)
- [ ] Aucun autre fichier API route

Variables d'environnement requises :

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ⚠️

Fichiers de support :

- [ ] `lib/supabase/admin.ts` (client admin)
- [ ] `lib/actions/auth.ts` (getProfile)
- [ ] `lib/actions/users.ts` (actions utilisateurs)
- [ ] `lib/actions/registrations.ts` (actions inscriptions)

---

## 🎯 Résumé

**app/api/admin** contient **UNIQUEMENT** :
- ✅ 2 fichiers pour la gestion des utilisateurs
- ✅ Utilise la clé service_role
- ✅ Nécessite permissions admin
- ✅ Sécurisé côté serveur

**app/api/registrations** contient **UNIQUEMENT** :
- ✅ 1 fichier pour générer les PDF
- ✅ Utilise le client standard avec RLS
- ✅ Nécessite authentification

**Total : 3 fichiers API routes**

---

**C'est tout ce dont vous avez besoin ! 🎉**

Aucun autre fichier n'est nécessaire dans `app/api`.
