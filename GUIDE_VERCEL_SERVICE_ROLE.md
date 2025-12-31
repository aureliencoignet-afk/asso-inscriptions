# ⚡ GUIDE RAPIDE - Configurer SUPABASE_SERVICE_ROLE_KEY sur Vercel

## 🎯 Problème à Résoudre

Erreur lors de la création d'utilisateur :
```
[AuthApiError]: User not allowed (code: 'not_admin')
```

## ✅ Solution en 3 Étapes

### Étape 1️⃣ : Trouver votre Clé Service Role

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **⚙️ Settings** (dans la barre latérale)
4. Allez dans **API**
5. Descendez jusqu'à **Project API keys**
6. Copiez la clé **`service_role`** (la LONGUE clé, pas la `anon`)

```
⚠️ ATTENTION : Cette clé est SENSIBLE !
❌ Ne la partagez JAMAIS
❌ Ne la commitez JAMAIS dans Git
✅ Stockez-la uniquement dans les variables d'environnement
```

---

### Étape 2️⃣ : Ajouter la Variable sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **Settings** (onglet en haut)
4. Dans le menu latéral, cliquez sur **Environment Variables**
5. Cliquez sur **Add New**

Remplissez :
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Collez la clé service_role copiée à l'étape 1]

Sélectionnez TOUS les environnements :
☑️ Production
☑️ Preview  
☑️ Development
```

6. Cliquez sur **Save**

---

### Étape 3️⃣ : Redéployer

**Option A - Redéploiement Automatique** (recommandé)
```bash
# Dans votre terminal local
git add .
git commit -m "fix: add service_role key support"
git push origin main

# Vercel redéploie automatiquement en 2-3 minutes
```

**Option B - Redéploiement Manuel**
1. Sur Vercel Dashboard
2. Onglet **Deployments**
3. Cliquez sur les 3 points `...` du dernier déploiement
4. Cliquez sur **Redeploy**
5. Cochez **Use existing Build Cache**
6. Cliquez sur **Redeploy**

---

## 🧪 Tester

Après le redéploiement :

1. Allez sur votre app : `https://votre-app.vercel.app`
2. Connectez-vous en tant qu'admin
3. Allez sur **Utilisateurs** dans le menu
4. Cliquez sur **+ Nouvel utilisateur**
5. Remplissez le formulaire :
   - Prénom : Test
   - Nom : User
   - Email : test@example.com
   - Mot de passe : Password123
   - Rôle : Lecture seule
6. Cliquez sur **Créer l'utilisateur**

✅ **Succès !** L'utilisateur est créé sans erreur
❌ **Erreur ?** Vérifiez la section Dépannage ci-dessous

---

## 🔍 Vérifier que la Variable est Bien Configurée

### Dans Vercel

1. Settings > Environment Variables
2. Vous devriez voir :
   ```
   SUPABASE_SERVICE_ROLE_KEY
   Encrypted • 3 environments
   ```

### Dans les Logs Vercel

1. Onglet **Deployments**
2. Cliquez sur le dernier déploiement
3. Cliquez sur **Build Logs**
4. Cherchez : ✅ Pas d'erreur "Missing Supabase admin environment variables"

---

## 🆘 Dépannage

### Erreur : "Missing Supabase admin environment variables"

**Cause** : La variable `SUPABASE_SERVICE_ROLE_KEY` n'est pas définie ou mal nommée

**Solution** :
1. Vérifiez le nom exact : `SUPABASE_SERVICE_ROLE_KEY` (pas de faute de frappe)
2. Vérifiez que tous les environnements sont cochés
3. Redéployez après l'ajout de la variable

### Erreur : "User not allowed" persiste

**Cause** : La clé copiée est incorrecte ou c'est la clé `anon` au lieu de `service_role`

**Solution** :
1. Retournez sur Supabase Dashboard > Settings > API
2. **Vérifiez que vous copiez la BONNE clé** :
   - ❌ `anon` key (commence par eyJh... et fait ~200 caractères)
   - ✅ `service_role` key (commence par eyJh... et fait ~300-400 caractères)
3. La clé `service_role` est généralement plus longue
4. Remplacez la variable sur Vercel avec la bonne clé
5. Redéployez

### Erreur : "Invalid API key"

**Cause** : La clé contient des espaces ou caractères supplémentaires

**Solution** :
1. Copiez la clé à nouveau depuis Supabase
2. Assurez-vous de copier TOUTE la clé (elle est longue)
3. Ne copiez pas d'espace avant ou après
4. Collez dans Vercel
5. Sauvegardez et redéployez

### La création d'utilisateur fonctionne en local mais pas en production

**Cause** : Variable d'environnement manquante en production

**Solution** :
1. Vérifiez que la variable est bien définie pour **Production**
2. Dans Vercel : Settings > Environment Variables
3. Cliquez sur `SUPABASE_SERVICE_ROLE_KEY`
4. Vérifiez que **Production** est coché
5. Si non coché, cochez-le et sauvegardez
6. Redéployez

---

## 📋 Checklist Finale

Avant de tester :

- [ ] Clé `service_role` copiée depuis Supabase (pas `anon`)
- [ ] Variable `SUPABASE_SERVICE_ROLE_KEY` ajoutée sur Vercel
- [ ] Nom de la variable exact (pas de faute de frappe)
- [ ] Les 3 environnements sont cochés (Production, Preview, Development)
- [ ] Code mis à jour (git push)
- [ ] Vercel a redéployé (attendez 2-3 minutes)
- [ ] Aucune erreur dans les Build Logs

Après configuration :

- [ ] Je peux créer un utilisateur
- [ ] Je peux réinitialiser un mot de passe
- [ ] Je peux supprimer un utilisateur
- [ ] Aucune erreur "User not allowed"

---

## 💡 Conseil Pro

**Pour vérifier rapidement que la clé fonctionne** :

Créez un fichier de test local `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Testez en local :
```bash
npm run dev
```

Si ça fonctionne en local, utilisez la MÊME clé sur Vercel !

---

## ✅ Résultat Attendu

Après configuration correcte :

1. Page Utilisateurs affiche tous les utilisateurs ✅
2. Bouton "Nouvel utilisateur" fonctionne ✅
3. Création d'utilisateur réussit sans erreur ✅
4. Email de confirmation envoyé à l'utilisateur ✅
5. Utilisateur apparaît dans la liste ✅

---

**C'est tout ! La gestion des utilisateurs fonctionne maintenant parfaitement ! 🎉**

En cas de problème persistant, vérifiez `CORRECTION_USER_CREATION.md` pour plus de détails techniques.
