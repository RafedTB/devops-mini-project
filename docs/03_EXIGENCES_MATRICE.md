# EXIGENCES MÉTIER & MATRICE DE TRAÇABILITÉ
**Projet :** Test et Validation d'une Application Web — Licence 3 TI  
**Application :** Plateforme E-Commerce & Avis (NestLearn)  
**Livrable :** Étape 3 / Semaine 3 — Spécifications, Critères d'Acceptation & Matrice  
**Version :** 1.0.0 (Simple & Accessible)  
**Date :** 2026-11-21  

---

## 1. Comment expliquer cette étape au professeur ?

> *« Pour l'étape 3, nous avons clarifié toutes les exigences de l'application en levant les ambiguïtés. Pour chaque exigence, nous avons écrit des critères d'acceptation précis avec le format **Given–When–Then** (Étant donné / Quand / Alors), puis nous avons construit la **matrice de traçabilité** qui relie chaque exigence à son risque et à son type de test. Cela garantit qu'aucune règle n'est oubliée. »*

---

## 2. Clarification des Ambiguïtés Métier

Avant de tester, nous avons levé 4 ambiguïtés fréquentes :

| Question / Ambiguïté identifiée | Règle retenue (Précision métier) |
|---|---|
| **Notes décimales :** Peut-on attribuer une note de `3.5` étoiles ? | **Non.** La note doit être un entier strict entre 1 et 5 (`@IsInt()`, `@Min(1)`, `@Max(5)`). |
| **Avis multiples :** Un client peut-il poster 5 avis sur le même produit ? | **Non.** Un utilisateur met à jour son avis ou chaque avis est tracé avec contrôle d'intégrité. |
| **Prix à 0€ :** Un produit peut-il être gratuit (0€) ? | **Oui.** La règle est `price >= 0` (un échantillon ou cadeau à 0€ est valide, mais `-1€` est rejeté). |
| **Modification des avis :** Un client peut-il modifier l'avis d'un autre client ? | **Strictement interdit.** Seul l'auteur de l'avis ou un `admin` a les droits de modification/suppression. |

---

## 3. Liste des Exigences et Critères Given–When–Then

### EX-01 : Inscription et Connexion Utilisateur
* **Description :** Un visiteur doit pouvoir créer un compte avec un email unique et se connecter pour obtenir un token JWT.
* **Critère d'acceptation 1 (Nominal) :**
  * **Given :** Un email non enregistré et un mot de passe de 8 caractères.
  * **When :** L'utilisateur soumet le formulaire d'inscription.
  * **Then :** Le compte est créé (HTTP 201) et le mot de passe est haché en bcrypt.
* **Critère d'acceptation 2 (Négatif) :**
  * **Given :** Un email déjà existant dans la base.
  * **When :** L'utilisateur tente de s'inscrire avec cet email.
  * **Then :** Le serveur renvoie une erreur HTTP 400 ou 409 (Email déjà utilisé).

### EX-02 : Contrôle des Rôles (RBAC)
* **Description :** Les routes d'administration (création/suppression de produits) sont strictement réservées au rôle `admin`.
* **Critère d'acceptation 1 (Interdit) :**
  * **Given :** Un utilisateur connecté avec le rôle standard `user`.
  * **When :** Il envoie une requête POST sur `/products`.
  * **Then :** Le serveur refuse l'accès avec une erreur HTTP 403 Forbidden.

### EX-03 : Gestion des Produits (Catalogue)
* **Description :** Un administrateur peut ajouter un produit avec un nom (3-50 car.), une description ($\ge 5$ car.) et un prix ($\ge 0$).
* **Critère d'acceptation 1 (Nominal) :**
  * **Given :** Un administrateur authentifié avec des données valides.
  * **When :** Il publie un produit à 49.99€.
  * **Then :** Le produit est enregistré et visible dans le catalogue (HTTP 201).
* **Critère d'acceptation 2 (Valeur Limite Rejetée) :**
  * **Given :** Un prix négatif de `-10€`.
  * **When :** L'administrateur tente de créer le produit.
  * **Then :** Le serveur bloque la création avec un code HTTP 400 Bad Request.

### EX-04 : Dépôt d'Avis et Notations
* **Description :** Tout utilisateur connecté peut noter un produit entre 1 et 5 étoiles avec un commentaire d'au moins 2 caractères.
* **Critère d'acceptation 1 (Nominal) :**
  * **Given :** Un utilisateur authentifié sur la page d'un produit.
  * **When :** Il saisit une note de 5 et le commentaire "Superbe qualité".
  * **Then :** L'avis est publié (HTTP 201) et rattaché à son profil.
* **Critère d'acceptation 2 (Hors Limite) :**
  * **Given :** Une note invalide de 6 étoiles ou 0 étoile.
  * **When :** L'utilisateur soumet son avis.
  * **Then :** Le système rejette la saisie (HTTP 400) et n'enregistre rien.

### EX-05 : Performance de Recherche (Non Fonctionnelle)
* **Description :** La consultation du catalogue et la recherche de produits doivent répondre rapidement.
* **Critère d'acceptation :**
  * **Given :** Une charge de 20 utilisateurs simultanés.
  * **When :** Ils effectuent des requêtes sur la liste des produits.
  * **Then :** 95% des requêtes répondent en moins de 500 ms sans aucune erreur 500.

---

## 4. Matrice de Traçabilité (Exigences ↔ Risques ↔ Tests)

La matrice permet de s'assurer que **100% des exigences sont couvertes par des tests** et que chaque risque est maîtrisé :

| ID Exigence | Intitulé Exigence | Risque Associé | Niveau de Test Prévu | Outil | Type de Scénario |
|:---|:---|:---|:---|:---|:---|
| **EX-01** | Inscription & Login JWT | R-AUT-04 (Token / Auth) | API REST + Unitaire | Postman / Jest | Positif (201) & Négatif (401) |
| **EX-02** | Contrôle RBAC Admin/User | R-SEC-01 (Élévation droits) | Intégration + API | Supertest / Postman | Négatif (403 Forbidden) |
| **EX-03** | Création Produit (Prix $\ge 0$) | R-DAT-02 (Prix négatif) | Unitaire + API | Jest + DTOs | Limite (-1€, 0€, 100€) |
| **EX-04** | Avis Produits (Note 1 à 5) | R-DAT-02 (Note hors limites) | Unitaire + BDD | Jest + PostgreSQL | Limites (0, 1, 5, 6 étoiles) |
| **EX-05** | Intégrité FK Produit/Avis | R-BUS-05 (Suppression orpheline) | Intégration BDD | TypeORM / Jest | Cas d'échec / Cascade |
| **EX-06** | Navigation SPA Catalogue | R-UI-06 (Erreur 404 Nginx) | Interface (E2E) | Playwright | Parcours complet navigateur |
| **EX-07** | Rapidité d'affichage | R-PERF-07 (Lenteur catalogue) | Performance | k6 | Seuil p95 < 500ms sous 20 VUs |

---

## 5. Checklist de Validation de l'Étape 3

- [x] Toutes les ambiguïtés métier ont été clarifiées.
- [x] Chaque exigence est décrite avec des critères vérifiables **Given–When–Then**.
- [x] La matrice de traçabilité relie chaque exigence à son risque et à son niveau de test.
- [x] Couverture complète : 100% des exigences sont associées à un outil de test.
