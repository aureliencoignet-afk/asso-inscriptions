# Format d'import Excel

## Colonnes requises (Format simple - Option A)

| Colonne | Type | Obligatoire | Description | Exemple |
|---------|------|-------------|-------------|---------|
| foyer_nom | Texte | Oui | Nom du foyer | Famille Dupont |
| responsable_email | Email | Non | Email du responsable | dupont@mail.fr |
| responsable_prenom | Texte | Non | Prénom du responsable | Jean |
| responsable_nom | Texte | Non | Nom du responsable | Dupont |
| responsable_tel | Texte | Non | Téléphone | 06 12 34 56 78 |
| adresse_ligne1 | Texte | Non | Adresse | 123 rue de la Paix |
| code_postal | Texte | Non | Code postal | 75001 |
| ville | Texte | Non | Ville | Paris |
| abonne_nom | Texte | Oui | Nom de l'abonné | Dupont |
| abonne_prenom | Texte | Oui | Prénom de l'abonné | Marie |
| abonne_date_naissance | Date | Non | Date de naissance | 01/01/2010 |
| saison | Texte | Oui | Libellé de la saison | 2024-2025 |
| cotisation_montant | Nombre | Oui | Montant de la cotisation | 50 |
| activite_1_nom | Texte | Non | Nom de l'activité 1 | Football |
| activite_1_montant | Nombre | Non | Montant de l'activité 1 | 200 |
| activite_2_nom | Texte | Non | Nom de l'activité 2 | Tennis |
| activite_2_montant | Nombre | Non | Montant de l'activité 2 | 150 |
| activite_3_nom | Texte | Non | Nom de l'activité 3 | Natation |
| activite_3_montant | Nombre | Non | Montant de l'activité 3 | 180 |
| echeancier_nb | Nombre | Oui | Nombre d'échéances (1 ou 3) | 3 |
| echeance1_date | Date | Oui | Date 1ère échéance | 15/09/2024 |
| echeance1_montant | Nombre | Non | Montant 1ère échéance (auto si vide) | 133.34 |
| echeance1_mode | Texte | Oui | Mode de paiement | CHEQUE |
| echeance1_num_cheque | Texte | Non | Numéro de chèque | 1234567 |
| echeance2_date | Date | Si 3x | Date 2ème échéance | 15/10/2024 |
| echeance2_montant | Nombre | Non | Montant 2ème échéance | 133.33 |
| echeance2_mode | Texte | Si 3x | Mode de paiement | CHEQUE |
| echeance2_num_cheque | Texte | Non | Numéro de chèque | 1234568 |
| echeance3_date | Date | Si 3x | Date 3ème échéance | 15/11/2024 |
| echeance3_montant | Nombre | Non | Montant 3ème échéance | 133.33 |
| echeance3_mode | Texte | Si 3x | Mode de paiement | CHEQUE |
| echeance3_num_cheque | Texte | Non | Numéro de chèque | 1234569 |

## Modes de paiement acceptés

- `CHEQUE`
- `LIQUIDE`
- `VIREMENT`
- `CB`
- `AUTRE`

## Exemple de ligne Excel

```
Famille Dupont | dupont@mail.fr | Jean | Dupont | 0612345678 | 123 rue de la Paix | 75001 | Paris | Dupont | Marie | 01/01/2010 | 2024-2025 | 50 | Football | 200 | Tennis | 150 | | | 3 | 15/09/2024 | 133.34 | CHEQUE | 1234567 | 15/10/2024 | 133.33 | CHEQUE | 1234568 | 15/11/2024 | 133.33 | CHEQUE | 1234569
```

## Règles de validation

1. **Saison** : Doit exister dans votre base de données
2. **Activités** : Doivent exister pour la saison sélectionnée
3. **Échéancier** :
   - Si `echeancier_nb = 1` : seulement echéance1 requise
   - Si `echeancier_nb = 3` : echéance1, 2 et 3 requises
   - Montants auto-calculés si non fournis (division en 3 avec arrondis)
4. **Foyers** : Upsert basé sur `foyer_nom` + `responsable_email`
5. **Abonnés** : Upsert basé sur `abonne_nom` + `abonne_prenom` + `date_naissance`

## Conseils

- Préparez vos données dans Excel d'abord
- Créez les saisons et activités avant l'import
- Testez avec quelques lignes d'abord
- Vérifiez le rapport d'import pour corriger les erreurs
- Les lignes en erreur ne bloquent pas l'import des autres lignes

## Format alternatif (Option B - Multi-onglets)

Pour les imports volumineux et structurés:

### Onglet FOYERS
| id_externe | nom | email | telephone | adresse | cp | ville |
|------------|-----|-------|-----------|---------|----|----|

### Onglet ABONNES
| id_externe | foyer_id_externe | nom | prenom | date_naissance |
|------------|------------------|-----|--------|----------------|

### Onglet INSCRIPTIONS
| abonne_id_externe | saison | cotisation_montant |
|-------------------|--------|-------------------|

### Onglet LIGNES_ACTIVITES
| inscription_id_externe | activite_nom | montant |
|------------------------|--------------|---------|

### Onglet ECHEANCES
| inscription_id_externe | rang | date | montant | mode | num_cheque |
|------------------------|------|------|---------|------|-----------|

Ce format est plus propre mais nécessite une gestion des IDs externes.
