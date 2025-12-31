# 🚀 Guide de Démarrage Rapide

Ce guide vous permettra de déployer l'application en **moins de 30 minutes**.

## Étape 1 : Configuration Supabase (10 min)

### 1.1 Créer un projet

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Cliquez sur **"New Project"**
3. Nom: `asso-inscriptions`
4. Mot de passe de base de données: généré automatiquement (conservez-le)
5. Région: choisissez la plus proche
6. Cliquez sur **"Create new project"** (attendez 2 minutes)

### 1.2 Exécuter le schéma SQL

1. Dans le menu gauche, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Ouvrez le fichier `supabase_schema.sql` de ce projet
4. **Copiez TOUT le contenu** (Ctrl+A puis Ctrl+C)
5. **Collez dans l'éditeur SQL** de Supabase
6. Cliquez sur **"Run"** (en bas à droite)
7. Attendez ~10 secondes, vous devriez voir "Success. No rows returned"

### 1.3 Créer votre compte admin

1. Allez dans **Authentication** > **Users** (menu gauche)
2. Cliquez sur **"Invite user"**
3. Email: `admin@votre-asso.fr` (remplacez)
4. Cliquez sur **"Invite user"**
5. **Consultez votre email** et cliquez sur le lien de confirmation
6. **Définissez un mot de passe**

### 1.4 Créer l'association et le profil admin

1. Retournez dans **SQL Editor**
2. Nouvelle requête et exécutez:

```sql
-- 1. Créer l'association
INSERT INTO associations (name, email, currency) 
VALUES ('Mon Association', 'contact@monasso.fr', 'EUR')
RETURNING id;
```

3. **Notez l'ID retourné** (ex: `550e8400-e29b-41d4-a716-446655440000`)

4. Allez dans **Authentication** > **Users**
5. Cliquez sur votre utilisateur, **copiez son UUID** (ex: `123e4567-e89b-12d3-a456-426614174000`)

6. Nouvelle requête SQL:

```sql
-- 2. Créer le profil admin (REMPLACEZ LES UUIDs !)
INSERT INTO profiles (id, association_id, role, display_name, email, is_active)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',  -- UUID de VOTRE utilisateur
  '550e8400-e29b-41d4-a716-446655440000',  -- UUID de VOTRE association
  'admin',
  'Administrateur',
  'admin@votre-asso.fr',  -- VOTRE email
  true
);
```

### 1.5 Récupérer les clés d'API

1. Allez dans **Project Settings** > **API**
2. **Copiez** ces deux valeurs:
   - `Project URL` (ex: https://xxx.supabase.co)
   - `anon public` key (commence par eyJ...)

## Étape 2 : Déploiement sur Vercel (5 min)

### 2.1 Créer un repo GitHub

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Créez un repo sur github.com, puis:
git remote add origin https://github.com/VOUS/asso-inscriptions.git
git push -u origin main
```

### 2.2 Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Cliquez sur **"Add New..."** > **"Project"**
3. **Import** votre repo GitHub `asso-inscriptions`
4. Dans **Environment Variables**, ajoutez:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxx...
```

5. Cliquez sur **"Deploy"**
6. Attendez 2-3 minutes ☕

## Étape 3 : Premier test (5 min)

### 3.1 Connexion

1. Ouvrez votre app déployée (ex: https://asso-inscriptions.vercel.app)
2. **Connectez-vous** avec:
   - Email: `admin@votre-asso.fr`
   - Mot de passe: celui que vous avez défini

### 3.2 Configuration initiale

1. Allez dans **Administration** (menu gauche)
2. Cliquez sur **Saisons**
3. Créez votre première saison:
   - Libellé: `2024-2025`
   - Date début: `2024-09-01`
   - Date fin: `2025-08-31`
   - Statut: `Ouverte`
   - **Créer**

4. Retournez à **Administration** > **Activités**
5. Créez vos premières activités:
   - Nom: `Football`
   - Prix: `200`
   - Saison: `2024-2025`
   - **Créer**

### 3.3 Première inscription

1. **Foyers** > **Nouveau foyer**
   - Nom: `Famille Test`
   - Email: `test@test.fr`
   - **Créer**

2. **Abonnés** > **Nouvel abonné**
   - Nom: `Test`
   - Prénom: `Jean`
   - Foyer: `Famille Test`
   - **Créer**

3. **Inscriptions** > **Nouvelle inscription**
   - Abonné: `Jean Test`
   - Saison: `2024-2025`
   - Cotisation: `50€`
   - Activités: `Football - 200€`
   - Total: `250€`
   - Échéancier: `3 fois`
   - **Valider**

🎉 **Bravo !** Votre application est opérationnelle !

## Étape 4 : Utilisateurs supplémentaires (optionnel)

Pour ajouter d'autres utilisateurs:

1. Supabase > **Authentication** > **Users** > **Invite user**
2. Supabase > **SQL Editor**:

```sql
INSERT INTO profiles (id, association_id, role, display_name, email, is_active)
VALUES (
  'UUID_DU_NOUVEL_USER',
  'UUID_DE_VOTRE_ASSO',
  'gestionnaire',  -- ou 'lecture'
  'Prénom Nom',
  'email@exemple.fr',
  true
);
```

## ⚡ Commandes rapides

```bash
# Développement local
npm install
cp .env.example .env.local
# Éditez .env.local avec vos clés
npm run dev

# Déploiement
git add .
git commit -m "Update"
git push
# Vercel déploie automatiquement!
```

## 🆘 Problèmes courants

### "Non authentifié" après connexion

- Vérifiez que vous avez créé le profil dans la table `profiles`
- Vérifiez que `association_id` correspond à l'UUID de votre association

### "Permission refusée"

- Vérifiez le rôle dans la table `profiles` (doit être 'admin' ou 'gestionnaire')
- Vérifiez que `is_active = true`

### Les données ne s'affichent pas

- Vérifiez que toutes les données ont le même `association_id`
- Consultez les logs Supabase: **Logs** > **Postgres Logs**

### Erreur lors du déploiement Vercel

- Vérifiez que les variables d'environnement sont bien définies
- Testez `npm run build` localement

## 📚 Ressources

- **Documentation complète**: [README.md](./README.md)
- **Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)

## 🎯 Prochaines étapes

1. Importez vos données via **Import** (fichier Excel)
2. Configurez vos activités et tarifs
3. Invitez vos gestionnaires
4. Commencez les inscriptions !

---

**Besoin d'aide ?** Consultez le README.md complet ou contactez le support technique.
