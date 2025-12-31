-- =====================================================
-- MIGRATION : Mise à jour de la table profiles
-- =====================================================
-- À exécuter UNIQUEMENT si vous avez une base existante 
-- avec la colonne display_name au lieu de first_name/last_name
-- =====================================================

-- Étape 1 : Vérifier la structure actuelle
-- Exécutez cette requête pour voir les colonnes actuelles :
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- =====================================================
-- Étape 2 : Migration si display_name existe
-- =====================================================

-- Supprimer l'ancienne colonne display_name si elle existe
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS display_name;

-- Ajouter first_name si elle n'existe pas
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

-- Ajouter last_name si elle n'existe pas
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- =====================================================
-- Étape 3 : Mettre à jour les valeurs NULL
-- =====================================================

-- Pour les profils existants sans first_name/last_name
UPDATE profiles 
SET 
  first_name = COALESCE(first_name, 'Admin'),
  last_name = COALESCE(last_name, 'User')
WHERE first_name IS NULL OR last_name IS NULL;

-- =====================================================
-- Étape 4 : Vérifier le résultat
-- =====================================================

-- Cette requête doit retourner tous vos profils avec first_name et last_name
SELECT id, email, first_name, last_name, role 
FROM profiles;

-- =====================================================
-- Étape 5 : Ajouter des contraintes NOT NULL (optionnel)
-- =====================================================

-- Une fois que tous les profils ont first_name et last_name,
-- vous pouvez ajouter des contraintes NOT NULL :

ALTER TABLE profiles 
  ALTER COLUMN first_name SET NOT NULL;

ALTER TABLE profiles 
  ALTER COLUMN last_name SET NOT NULL;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Après avoir exécuté ce script, redéployez votre application
-- La page /admin/users devrait maintenant fonctionner
-- =====================================================
