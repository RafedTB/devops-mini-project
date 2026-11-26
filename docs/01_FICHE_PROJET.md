# FICHE PROJET & CARTOGRAPHIE DES RISQUES QUALITÉ
**Projet :** Test et Validation d'une Application Web — Licence 3 TI  
**Application cible :** Plateforme E-Commerce & Système d'Avis Produits (NestLearn)  
**Livrable :** Étape 1 / Semaine 1 — Cadrage, Périmètre et Analyse des Risques  
**Version :** 1.0.0  
**Date :** 2026-11-21  

---

## 1. Contexte et Présentation du Système Testé

Conformément à la section 1.1 et 1.2 du sujet d'atelier (*« Une application existante ou développée dans un autre module peut être utilisée, à condition de disposer de fonctionnalités et de règles métier testables »*), la campagne de test est appliquée à la plateforme **NestLearn (E-Commerce & Product Reviews)**.

### 1.1 Architecture Technique
L'application repose sur une architecture multi-tiers conteneurisée :
* **Frontend :** Single Page Application en **React 19 + TypeScript + Vite**, servie via un conteneur **Nginx Alpine**.
* **Backend API :** API REST modulaire développée sous **NestJS (Node.js 20)** avec injection de dépendances, décorateurs de validation (`class-validator`), et documentation OpenAPI / Swagger.
* **Persistance :** Base de données relationnelle **PostgreSQL 16 Alpine**, pilotée par l'ORM **TypeORM** (gestion des entités, relations, migrations).
* **Environnement d'exécution :** Orchestration via **Docker Compose** (services frontend, backend, postgres, pgadmin).

```
                      +------------------------------------------+
                      |         Docker Compose Network           |
                      |                                          |
Client (Navigateur) ->|  Port 80   : Frontend (React / Nginx)    |
                      |  Port 3000 : Backend API (NestJS)        |
                      |                 |                        |
                      |                 v                        |
                      |  Port 5433 : Base de données PostgreSQL  |
                      +------------------------------------------+
```

---

## 2. Correspondance avec le Référentiel du Sujet

L'application existante couvre l'ensemble des modules requis par le sujet académique :

| Module du sujet | Équivalent dans NestLearn | Fonctionnalités & Règles métier testables |
|---|---|---|
| **Authentification** | `src/users` (Auth) | Inscription, connexion JWT, hash bcrypt, déconnexion, contrôle des mots de passe. |
| **Gestion Utilisateurs** | `src/users` (RBAC) | Rôles `user` et `admin`, garde de sécurité `@Roles()`, profil utilisateur. |
| **Réclamations / Objets métier** | `src/reviews` & `src/products` | Création, modification, consultation, suppression de produits et d'avis. |
| **Cycle de vie / Statuts** | `src/orders` & `src/reviews` | Statuts de commandes (En attente, Payée, Livrée, Annulée) et validation des avis. |
| **Recherche & Filtrage** | `src/products` | Recherche textuelle, tri par prix, pagination et catégories. |
| **API REST** | Contrôleurs NestJS | Échanges JSON, codes HTTP (200, 201, 400, 401, 403, 404, 500), DTOs. |
| **Persistance** | TypeORM & PostgreSQL | Intégrité référentielle (clés étrangères User-Review-Product), unicité email. |

### Règles Métier Clés à Tester :
1. **Utilisateurs :** Email unique et format valide ; mot de passe entre 6 et 50 caractères ; rôle par défaut `user`.
2. **Produits (Admin uniquement) :** Titre obligatoire (3 à 50 caractères) ; description obligatoire (min. 5 caractères) ; prix positif ou nul ($\ge 0$).
3. **Avis & Notations (Client authentifié) :** Note entière obligatoire entre 1 et 5 étoiles ; commentaire obligatoire (min. 2 caractères) ; un utilisateur ne peut modifier ou supprimer que ses propres avis (sauf administrateur).
4. **Commandes :** Coordonnées de livraison complètes obligatoires ; panier d'au moins 1 article ; quantité d'articles $\ge 1$.

---

## 3. Périmètre de Test (Scope)

### 3.1 Dans le Périmètre (IN-SCOPE)
* **Périmètre Fonctionnel :**
  * Parcours d'authentification (Cas valides, mots de passe erronés, tokens expirés/malformés).
  * Contrôle d'accès basé sur les rôles (RBAC) : interdiction aux utilisateurs simples d'accéder aux routes d'administration.
  * Validation stricte des données entrantes (DTOs, contraintes aux limites).
  * CRUD complet sur les Produits et les Avis clients.
  * Cycle de création d'une commande avec vérification des totaux et des données requises.
* **Périmètre Technique :**
  * Tests unitaires automatisés des services métier (Jest).
  * Tests d'intégration et persistance en base de données.
  * Tests d'API REST (Codes HTTP, structures JSON).
  * Test automatisé End-to-End d'un parcours critique (Interface Web).
  * Test de performance élémentaire (Temps de réponse de l'API sous charge modérée).

### 3.2 Hors Périmètre (OUT-OF-SCOPE)
* Intégration de passerelles bancaires réelles en production (Stripe/PayPal live).
* Serveur d'envoi d'e-mails réel en production (les flux d'e-mails sont vérifiés via mocks/stubs ou logs).
* Tests de compatibilité sur navigateurs obsolètes (ex: Internet Explorer).
* Tests de charge extrême ou d'intrusion avancée (pentest red team).

---

## 4. Concepts Qualité Fondamentaux (ISTQB)

Pour répondre aux exigences pédagogiques de la Semaine 1 :

* **Erreur (Error / Mistake) :** Action humaine produisant un résultat incorrect (ex: le développeur omet d'ajouter le décorateur `@Min(0)` sur le champ `price` du DTO).
* **Défaut (Bug / Fault / Defect) :** Imperfection ou anomalie présente dans le code source ou la documentation résultant de l'erreur (ex: le système accepte un prix de `-50€`).
* **Défaillance (Failure) :** Manifestation physique ou écart observé à l'exécution par rapport au comportement attendu (ex: le total d'une commande devient négatif et bloque le traitement).
* **Vérification :** Confirmation par l'examen de preuves tangibles que le logiciel a été conçu conformément aux spécifications (« *Avons-nous bien construit le produit ?* »).
* **Validation :** Confirmation que le logiciel répond aux besoins réels et opérationnels des utilisateurs finaux (« *Avons-nous construit le bon produit ?* »).

---

## 5. Cartographie et Analyse des Risques Qualité

Chaque risque est évalué selon sa **Probabilité** ($P \in [1, 3]$) et son **Impact** ($I \in [1, 3]$).  
La **Criticité** ($C = P \times I$) détermine le niveau de priorité :
* **Critique (6 - 9) :** Test prioritaire et bloquant pour la livraison.
* **Moyen (3 - 4) :** Test systématique requis dans la suite de régression.
* **Faible (1 - 2) :** Test exploratoire ou secondaire.

| ID | Risque Qualité Identifié | Module | P | I | Criticité | Conséquence Potentielle | Stratégie d'Atténuation / Niveau de Test |
|:---|:---|:---|:---:|:---:|:---:|:---|:---|
| **R-SEC-01** | Élévation de privilèges (Bypass RBAC) | Auth / Users | 2 | 3 | **6 (Critique)** | Un utilisateur simple crée ou supprime un produit ou modifie l'avis d'un tiers. | Tests d'intégration des Guards NestJS (`AuthRolesGuard`) et tests négatifs API REST (403 Forbidden). |
| **R-DAT-02** | Injection de données invalides (Note hors [1-5], prix négatif) | Products / Reviews | 3 | 3 | **9 (Critique)** | Corruption des moyennes de notes, intégrité financière corrompue. | Tests unitaires sur les DTOs (`class-validator`), tests aux valeurs limites (BVA) et tests d'intégration DB. |
| **R-SEC-03** | Injection SQL ou corruption de persistance | Base de données | 1 | 3 | **3 (Moyen)** | Fuite de données ou suppression non autorisée. | Utilisation stricte de l'ORM TypeORM avec requêtes paramétrées ; tests d'intégration CRUD. |
| **R-AUT-04** | Session JWT invalide, expirée ou contrefaite | Auth | 2 | 3 | **6 (Critique)** | Accès anonyme à des données personnelles ou d'achats. | Tests API REST avec tokens périmés, modifiés ou absents (401 Unauthorized). |
| **R-BUS-05** | Suppression en cascade orpheline (Produit supprimé avec avis) | Relations DB | 2 | 2 | **4 (Moyen)** | Crash applicatif (500 Internal Error) lors de la consultation d'un avis sans produit. | Tests de contraintes d'intégrité référentielle TypeORM (Foreign Key constraints). |
| **R-UI-06** | Échec de navigation SPA ou rechargement (Erreurs 404 Nginx) | Frontend | 2 | 2 | **4 (Moyen)** | Écran blanc pour l'utilisateur lors d'un rafraîchissement F5 sur `/products/:id`. | Test E2E Playwright de parcours complet avec rafraîchissement de page et vérification du routage Nginx. |
| **R-PERF-07** | Dégradation des temps de réponse sur le catalogue | Products / Search | 2 | 2 | **4 (Moyen)** | Lenteur d'affichage des listes produits lors d'une charge modérée. | Test non fonctionnel de performance (k6) mesurant le seuil p95 sous 20 utilisateurs simultanés. |

---

## 6. Environnement Technique de Test

| Élément | Caractéristique / Version | Rôle |
|---|---|---|
| **OS d'exécution** | Windows 11 / Linux Alpine (Docker) | Environnement de développement et conteneurs |
| **Runtime Backend** | Node.js v20.x, TypeScript 5.x | Exécution du serveur NestJS |
| **Moteur BDD** | PostgreSQL 16 Alpine (Port local 5433) | Stockage et vérification de la persistance |
| **Framework de Test Unitaire** | Jest 29.x | Tests unitaires et couverture de code |
| **Outil de Test API** | Postman / Newman (ou Bruno / Supertest) | Automatisation des requêtes REST |
| **Outil E2E Interface** | Playwright (ou Cypress) | Automatisation du parcours navigateur critique |
| **Outil Non Fonctionnel** | k6 | Test de performance et temps de réponse |

---

## 7. Critères d'Acceptation de l'Étape 1

- [x] Application cible choisie et justifiée selon les règles du sujet (Option A : E-Commerce & Reviews).
- [x] Architecture et fonctionnalités clés documentées.
- [x] Périmètre In-Scope et Out-of-Scope explicitement délimité.
- [x] Concepts fondamentaux ISTQB clarifiés.
- [x] Cartographie de 7 risques qualité documentée avec probabilité, impact et criticité.
- [x] Environnements et outils de test définis.
