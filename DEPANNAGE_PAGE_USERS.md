# 🔧 DÉPANNAGE - Page Utilisateurs ne s'affiche pas

## 🎯 Symptôme

La page `/admin/users` ne s'affiche pas ou reste blanche.

## 🔍 Causes Possibles

### 1. Structure de Base de Données Incorrecte ⚠️

**Problème** : La table `profiles` a une colonne `display_name` au lieu de `first_name` et `last_name`.

**Comment vérifier** :
1. Allez sur Supabase Dashboard
2. Table Editor > `profiles`
3. Vérifiez les colonnes

**Colonnes attendues** :
- ✅ `id` (uuid)
- ✅ `association_id` (uuid)
- ✅ `role` (text)
- ✅ `first_name` (text) ← DOIT EXISTER
- ✅ `last_name` (text) ← DOIT EXISTER
- ✅ `email` (text)
- ✅ `is_active` (boolean)
- ✅ `created_at` (timestamp)
- ✅ `updated_at` (timestamp)

**Solution** : Exécutez le script `migration_profiles.sql`

---

### 2. Table Profiles Vide

**Problème** : Aucun utilisateur dans la table `profiles`.

**Comment vérifier** :
```sql
SELECT * FROM profiles;
```

**Solution** :
1. Si votre compte admin n'existe pas, créez-le depuis Supabase :
   ```sql
   -- Trouvez votre user_id depuis auth.users
   SELECT id, email FROM auth.users;

   -- Créez le profil admin
   INSERT INTO profiles (id, association_id, role, first_name, last_name, email)
   VALUES (
     'votre-user-id',
     'votre-association-id',
     'admin',
     'Admin',
     'User',
     'votre-email@example.com'
   );
   ```

2. Ou créez un utilisateur depuis l'interface après avoir corrigé le schéma

---

### 3. Permissions Insuffisantes

**Problème** : Votre compte n'a pas le rôle `admin`.

**Comment vérifier** :
```sql
SELECT id, email, role FROM profiles WHERE email = 'votre-email@example.com';
```

**Solution** :
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'votre-email@example.com';
```

---

### 4. Row Level Security (RLS) Mal Configurée

**Problème** : Les policies RLS bloquent l'accès.

**Comment vérifier** :
```sql
-- Voir les policies sur profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Solution** : Désactivez temporairement RLS pour tester :
```sql
-- TEMPORAIRE - À NE PAS GARDER EN PRODUCTION
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Si ça fonctionne, le problème vient des policies. Réactivez RLS :
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

Puis vérifiez/corrigez vos policies (voir `supabase_schema.sql`).

---

## 🚀 Solution Rapide - Recréer la Base

Si vous êtes en développement et que vous pouvez tout supprimer :

1. **Supprimer les tables** :
   ```sql
   DROP TABLE IF EXISTS planned_payments CASCADE;
   DROP TABLE IF EXISTS installments CASCADE;
   DROP TABLE IF EXISTS registration_lines CASCADE;
   DROP TABLE IF EXISTS registrations CASCADE;
   DROP TABLE IF EXISTS activities CASCADE;
   DROP TABLE IF EXISTS seasons CASCADE;
   DROP TABLE IF EXISTS subscribers CASCADE;
   DROP TABLE IF EXISTS households CASCADE;
   DROP TABLE IF EXISTS profiles CASCADE;
   DROP TABLE IF EXISTS associations CASCADE;
   ```

2. **Réexécuter le schéma complet** :
   - Ouvrez `supabase_schema.sql`
   - Copiez TOUT le contenu
   - Collez dans Supabase SQL Editor
   - Exécutez

3. **Redémarrez votre application**

---

## 📋 Checklist de Diagnostic

Suivez ces étapes dans l'ordre :

### Étape 1 : Vérifier la Structure

- [ ] La table `profiles` existe
- [ ] Les colonnes `first_name` et `last_name` existent
- [ ] La colonne `display_name` N'existe PAS

**Si non** → Exécutez `migration_profiles.sql`

### Étape 2 : Vérifier les Données

- [ ] Au moins un profil existe dans la table
- [ ] Votre profil a le rôle `admin`
- [ ] Les champs first_name et last_name ne sont pas NULL

**Si non** → Créez/Mettez à jour votre profil

### Étape 3 : Vérifier les Permissions

- [ ] RLS est activée sur la table profiles
- [ ] Les policies permettent aux admins de voir tous les profils
- [ ] Votre association_id correspond

**Si non** → Réexécutez les policies du schema

### Étape 4 : Vérifier l'Application

- [ ] Variables d'environnement correctes
- [ ] Build passe sans erreur TypeScript
- [ ] Aucune erreur dans la console browser

**Si non** → Vérifiez les logs Vercel

---

## 🧪 Test Manuel

### Dans Supabase SQL Editor :

```sql
-- Test 1 : Structure de la table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Résultat attendu : first_name et last_name présents

-- Test 2 : Données existantes
SELECT id, email, first_name, last_name, role, association_id 
FROM profiles;

-- Résultat attendu : Au moins 1 ligne avec role='admin'

-- Test 3 : Votre profil
SELECT * FROM profiles WHERE email = 'votre-email@example.com';

-- Résultat attendu : 1 ligne avec tous les champs remplis

-- Test 4 : RLS et policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Résultat attendu : Policies pour SELECT, INSERT, UPDATE, DELETE
```

---

## 💡 Messages d'Erreur Courants

### "column profiles.display_name does not exist"

**Cause** : Structure de base incorrecte

**Solution** : Exécutez `migration_profiles.sql`

---

### "Permission admin requise"

**Cause** : Votre compte n'a pas le rôle admin

**Solution** :
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'votre-email@example.com';
```

---

### "Cannot read properties of null"

**Cause** : Profil non trouvé ou association_id incorrect

**Solution** :
1. Vérifiez que votre profil existe
2. Vérifiez que l'association_id correspond

---

## 📞 Besoin d'Aide ?

Si après avoir suivi ce guide la page ne fonctionne toujours pas :

1. **Ouvrez la console browser** (F12)
2. **Allez sur l'onglet Network**
3. **Rechargez la page**
4. **Cherchez les requêtes en erreur** (rouge)
5. **Notez le message d'erreur exact**

L'erreur exacte permettra d'identifier le problème précis.

---

## ✅ Page Corrigée - Version Améliorée

La nouvelle version de la page inclut :
- ✅ Gestion d'erreurs complète
- ✅ Message d'erreur explicite
- ✅ Instructions de migration SQL
- ✅ Bouton de retour au dashboard
- ✅ Affichage de l'erreur exacte

Si vous voyez maintenant un message d'erreur rouge avec des instructions, c'est **normal** et **bien** ! Suivez simplement les instructions affichées.

---

## 🎯 Résumé Express

**90% des problèmes viennent de** :
1. Colonnes `first_name`/`last_name` manquantes → Exécutez `migration_profiles.sql`
2. Aucun profil admin → Créez-le dans Supabase
3. RLS mal configurée → Réexécutez `supabase_schema.sql`

**Solution la plus simple** :
- Supprimez tout et réexécutez `supabase_schema.sql` complet

---

**Après correction, la page devrait s'afficher normalement ! 🎉**
