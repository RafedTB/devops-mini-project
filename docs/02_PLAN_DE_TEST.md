# PLAN DE TEST & STRATÉGIE GLOBALE DE VALIDATION
**Projet :** Test et Validation d'une Application Web — Licence 3 TI  
**Application :** Plateforme E-Commerce & Système d'Avis (NestLearn)  
**Norme de référence :** IEEE 829 / ISTQB Foundation Level  
**Livrable :** Étape 2 / Semaine 2 — Stratégie et Plan de Test Versionné  
**Version :** 1.0.0  
**Date :** 2026-11-21  

---

## 1. Introduction et Objectifs de la Campagne

Le présent document formalise la stratégie de test et le plan directeur de validation pour l'application **NestLearn**.  
L'objectif est de :
1. Définir les niveaux de vérification et d'assurance qualité logicielle.
2. Établir des critères quantifiables d'acceptabilité pour la mise en production.
3. Structurer les responsabilités, les environnements et l'outillage technique.
4. Prévenir les anomalies critiques identifiées lors de l'analyse des risques (Étape 1).

---

## 2. Niveaux de Test et Approche Pyramidale

La stratégie s'appuie sur la pyramide des tests pour équilibrer rapidité d'exécution, isolation des défauts et fidélité opérationnelle :

```
                     / \
                    /   \       Tests Non Fonctionnels (k6 - Perf)
                   / E2E \      Tests UI / Système (Playwright - 1 flux critique)
                  /-------\
                 /   API   \    Tests API REST (Postman / Supertest)
                /-----------\
               / Intégration \  Tests d'Intégration & BDD (PostgreSQL / TypeORM)
              /---------------\
             /    Unitaires    \ Tests Unitaires (Jest / AAA - Services & DTOs)
            /-------------------\
```

### 2.1 Niveau 1 : Tests Unitaires (Unit Tests)
* **Cible :** Classes de service (`UsersService`, `ProductsService`, `ReviewsService`, `OrdersService`) et validation des DTOs.
* **Technique :** Boîte blanche, pattern **AAA (Arrange-Act-Assert)**, isolation stricte via doubles de test (Mocks Jest des repositories TypeORM).
* **Objectif :** Valider la logique métier pure, la gestion des exceptions et les validations `@IsNotEmpty()`, `@Min()`, `@Length()`.
* **Outillage :** `Jest` + `ts-jest`.

### 2.2 Niveau 2 : Tests d'Intégration (Integration Tests)
* **Cible :** Interaction entre les services, l'ORM TypeORM et la base de données relationnelle PostgreSQL.
* **Technique :** Boîte grise sur base de données de test isolée (`devops_test`).
* **Objectif :** Vérifier les opérations CRUD réelles, le respect des contraintes d'intégrité (clés étrangères, unicité des emails, suppression en cascade).
* **Outillage :** `Jest` + instance PostgreSQL conteneurisée.

### 2.3 Niveau 3 : Tests Système & API REST
* **Cible :** Endpoints HTTP exposés par les contrôleurs NestJS.
* **Technique :** Boîte noire avec envoi de requêtes HTTP réelles et validation des codes de retour et schémas JSON.
* **Objectif :** Vérifier les codes de statut HTTP (200, 201, 400, 401, 403, 404), les en-têtes `Authorization: Bearer <JWT>`, et la structure des payloads d'erreur.
* **Outillage :** Collection `Postman` / `Newman` (ou `Supertest`).

### 2.4 Niveau 4 : Tests de Bout en Bout / Interface (E2E UI)
* **Cible :** Application Web complète (Frontend React 19 + API NestJS + PostgreSQL).
* **Technique :** Simulation du comportement utilisateur réel dans un navigateur Chromium sans tête (headless).
* **Objectif :** Valider le parcours critique : *Connexion utilisateur -> Consultation du catalogue -> Sélection d'un produit -> Dépôt d'un avis ou passage de commande*.
* **Outillage :** `Playwright`.

### 2.5 Niveau 5 : Tests Non Fonctionnels (Performance & Robustesse)
* **Cible :** Endpoints à fort trafic (Consultation et recherche de produits).
* **Technique :** Injection de charge virtuelle progressive.
* **Objectif :** Mesurer le débit (RPS), le taux d'erreur (< 1%) et le temps de réponse au 95e percentile ($p95 < 500\text{ ms}$) sous 20 utilisateurs concurrents.
* **Outillage :** `k6`.

---

## 3. Environnements de Test et Gestion des Données

Trois environnements distincts garantissent la reproductibilité des tests sans risque de corruption :

| Environnement | Caractéristiques | Usage principal |
|---|---|---|
| **ENV-DEV** (Local) | `NODE_ENV=development`<br>PostgreSQL local (Port 5433)<br>Frontend Vite dev server | Développement de fonctionnalités et tests manuels unitaires. |
| **ENV-TEST** (Automatisé) | `NODE_ENV=test`<br>Base de données dédiée `devops_test`<br>Tables réinitialisées via seeders avant exécution | Exécution des tests unitaires, d'intégration et suites de régression. |
| **ENV-DOCKER** (Staging) | Docker Compose multi-conteneurs :<br>- `nestlearn-frontend` (Port 80)<br>- `nestlearn-backend` (Port 3000)<br>- `nestlearn-postgres` (Port 5432) | Tests système API, tests E2E Playwright et tests de charge k6. |

---

## 4. Rôles et Responsabilités de l'Équipe

| Rôle | Responsabilités Principales |
|---|---|
| **Lead QA / Concepteur de Test** | Rédaction du plan de test, conception des cas de test (Partitions d'équivalence, BVA), validation des rapports et de la décision de livraison. |
| **Ingénieur Automatisation (SDET)** | Développement et maintenance des scripts de test (Jest, Playwright, k6), intégration dans la chaîne CI/CD. |
| **Développeur (Feature Owner)** | Correction des anomalies qualifiées, revue des tests de régression, respect des règles d'acceptation. |

---

## 5. Critères d'Entrée et de Sortie (Entry / Exit Criteria)

### 5.1 Critères d'Entrée (Quand démarrer une phase de test ?)
* Le code source compile sans erreur TypeScript (`npm run build`).
* Les migrations de base de données s'exécutent avec succès.
* Les jeux de données de test (`db/seed.ts`) sont disponibles et validés.
* Les spécifications et critères d'acceptation de la fonctionnalité sont documentés.

### 5.2 Critères de Sortie (Quand valider la livraison ?)
* **Couverture de code unitaire :** $\ge 75\%$ des lignes de code sur les services métier (`src/**/*.service.ts`).
* **Taux d'exécution des tests planifiés :** $100\%$ des cas de test documentés exécutés.
* **Taux de succès des tests :** $\ge 95\%$ de tests passants sur la suite globale.
* **Anomalies résiduelles :**
  * **0 anomalie Bloquante** (Crash serveur, faille d'authentification, perte de données).
  * **0 anomalie Majeure** non contournée par une solution documentée.
  * Maximum 3 anomalies Mineures acceptées sous réserve d'approbation.
* **Performance :** Temps de réponse moyen de l'API $\le 300\text{ ms}$, $p95 \le 500\text{ ms}$ sous charge de 20 VUs.

---

## 6. Critères de Suspension et de Reprise

### 6.1 Critères de Suspension
La campagne de test est immédiatement **suspendue** si l'une des conditions suivantes survient :
1. Échec total du service d'authentification (génération JWT impossible, blocage de l'accès à tous les comptes).
2. Indisponibilité persistante du conteneur de base de données PostgreSQL.
3. Taux d'échec supérieur à 40% sur la suite de tests unitaires suite à un refactoring.

### 6.2 Critères de Reprise
La campagne reprend après :
1. Livraison d'un correctif (Hotfix) identifié avec ticket d'anomalie.
2. Exécution réussie d'un test de confirmation dédié (Smoke Test) sur le point bloquant.
3. Rejeu complet de la suite de régression impactée.

---

## 7. Organisation du Dépôt Git et Conventions

### 7.1 Structure des Fichiers de Test
```
devops/course/
├── docs/                         # Documentation de qualification
│   ├── 01_FICHE_PROJET.md        # Cadrage et analyse des risques
│   ├── 02_PLAN_DE_TEST.md        # Stratégie et plan de test (ce document)
│   ├── 03_EXIGENCES_MATRICE.md   # Matrice de traçabilité exigences/tests
│   ├── 04_CATALOGUE_TESTS.md     # Catalogue des cas de test (15+ cas)
│   ├── postman/                  # Collection API REST & environnements
│   ├── playwright/               # Scripts E2E d'interface
│   └── perf/                     # Scripts k6 de performance
├── src/                          # Code source backend
│   └── **/*.spec.ts              # Tests unitaires Jest colocaliés avec les services
└── test/                         # Tests d'intégration et E2E
    ├── jest-e2e.json             # Configuration d'exécution
    └── *.e2e-spec.ts             # Suites d'intégration HTTP
```

### 7.2 Convention de Nommage des Fichiers et Scénarios
* Tests unitaires : `<module>.service.spec.ts`
* Tests d'intégration : `<module>.e2e-spec.ts`
* Pattern d'écriture dans les specs :
  ```typescript
  describe('ReviewsService', () => {
    describe('createReview()', () => {
      it('should create review successfully when rating is between 1 and 5 (Positive)', () => { ... });
      it('should throw BadRequestException when rating is greater than 5 (Boundary Value)', () => { ... });
    });
  });
  ```

---

## 8. Calendrier Prévisionnel de la Campagne (10 Semaines)

| Étape / Semaine | Activité Clé | Livrable Produit |
|---|---|---|
| **Semaine 1** | Cadrage, périmètre et cartographie des risques | Fiche projet & matrice des risques (`01_FICHE_PROJET.md`) |
| **Semaine 2** | Définition de la stratégie et plan directeur | Plan de test global versionné (`02_PLAN_DE_TEST.md`) |
| **Semaine 3** | Analyse des exigences et critères Given-When-Then | Matrice de traçabilité exigences–tests (`03_EXIGENCES_MATRICE.md`) |
| **Semaine 4** | Conception boite noire (EP, BVA, tables décision) | Catalogue d'au moins 15 cas de test documentés |
| **Semaine 5** | Transitions d'état & tests exploratoires | Modélisation des états et premières fiches d'anomalie |
| **Semaine 6** | Automatisation des tests unitaires métier | Suite Jest & rapport de couverture de code ($\ge 75\%$) |
| **Semaine 7** | Tests d'intégration & persistance BDD | Tests d'intégrité relationnelle et CRUD PostgreSQL |
| **Semaine 8** | Automatisation des tests d'API REST | Collection Postman/Newman validée avec assertions |
| **Semaine 9** | Tests E2E interface & tests de charge | Script Playwright E2E + rapport de performance k6 |
| **Semaine 10** | Bilan de campagne & décision de livraison | Registre d'anomalies consolidé et décision argumentée |

---

## 9. Checklist de Validation de l'Étape 2

- [x] Niveaux de test définis selon la pyramide (Unitaire, Intégration, API, E2E, Performance).
- [x] Outils sélectionnés et justifiés pour chaque niveau (Jest, Postman, Playwright, k6).
- [x] Environnements d'exécution et données de test isolés.
- [x] Rôles et responsabilités explicités.
- [x] Critères d'entrée et de sortie quantifiables (Couverture $\ge 75\%$, 0 bug critique).
- [x] Critères de suspension et de reprise établis.
- [x] Organisation du dépôt Git et conventions de test documentées.
- [x] Calendrier d'exécution prévisionnel formalisé sur 10 semaines.
