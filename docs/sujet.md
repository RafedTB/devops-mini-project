# ATELIER TEST ET VALIDATION DES LOGICIELS
*Mini-projet universitaire — Licence 3*

# MINI-PROJET : Test et validation d'une application web

## RéclaGest — Gestion des réclamations

**Licence 3 — Technologies de l'Information**
**Spécialité :** Développement des systèmes d'information
**Durée :** 10 semaines | Travail individuel ou en binôme
**Nature :** Projet fil rouge pratique encadré

### Objectif général

Concevoir, exécuter et documenter une campagne de tests permettant d'évaluer la qualité d'une application, de détecter les anomalies et de prendre une décision argumentée concernant sa livraison.

---

## 1. Contexte et présentation du projet

Ce mini-projet est construit à partir des objectifs, compétences, livrables et outils du document « Atelier Test et validation des logiciels ». Il adapte la progression initialement prévue sur 12 semaines à une durée de 10 semaines, en regroupant certaines activités.

Les étudiants travailleront sur RéclaGest, une application web de gestion des réclamations. L'application permet aux utilisateurs de déposer des réclamations, de suivre leur traitement et aux agents de les prendre en charge jusqu'à leur résolution. Une application existante ou développée dans un autre module peut être utilisée, à condition de disposer de fonctionnalités et de règles métier testables.

### 1.1 Fonctionnalités à tester

| Module | Fonctionnalités principales |
|---|---|
| Authentification | Connexion, déconnexion, identifiants invalides. |
| Gestion des utilisateurs | Création, consultation et contrôle des rôles. |
| Réclamations | Création, modification, consultation et clôture. |
| Affectation | Attribution d'une réclamation à un agent. |
| Suivi | Historique des changements et des statuts. |
| Recherche | Filtrage par statut, priorité et date. |
| API REST | Échanges JSON, codes HTTP et gestion des erreurs. |
| Persistance | Enregistrement, intégrité et cohérence des données. |

### 1.2 Règles métier de référence

- Une réclamation possède un identifiant, un titre, une description, une catégorie, une priorité, un statut et une date de création.
- Le titre est obligatoire et doit comporter entre 5 et 100 caractères.
- La description est obligatoire et doit comporter entre 10 et 1 000 caractères.
- Une réclamation est créée au statut NOUVELLE.
- Les transitions autorisées sont : NOUVELLE → EN_COURS → RESOLUE → CLOTUREE.
- Une réclamation clôturée ne peut plus être modifiée par un utilisateur ordinaire.
- Un client ne peut consulter que ses propres réclamations ; un agent traite les réclamations qui lui sont accessibles ; un administrateur gère les utilisateurs et les affectations.

Ces règles constituent le référentiel de test du projet. Si une application existante est utilisée, les étudiants doivent adapter les règles à ses exigences réelles et documenter les éventuelles différences.

---

## 2. Objectifs pédagogiques

À l'issue du projet, l'étudiant devra être capable de :

- Analyser la testabilité des exigences et identifier les risques qualité.
- Élaborer une stratégie et un plan de test adaptés à l'application.
- Concevoir des cas de test à partir des partitions d'équivalence, des valeurs limites, des tables de décision et des transitions d'état.
- Préparer des données et un environnement de test reproductibles.
- Écrire et exécuter des tests unitaires et d'intégration.
- Vérifier une API REST et automatiser un parcours fonctionnel critique.
- Réaliser un test non fonctionnel élémentaire et interpréter ses résultats.
- Documenter, classer et suivre les anomalies.
- Mesurer la couverture, préparer une suite de régression et interpréter les résultats.
- Produire un bilan de campagne et justifier une décision de validation ou de refus de livraison.

---

## 3. Plan de travail sur 10 semaines

| Semaine / thème | Activités principales | Livrables attendus |
|---|---|---|
| **Semaine 1** — Compréhension et analyse des risques | Découvrir l'application et ses fonctions critiques ; distinguer erreur, défaut, défaillance, vérification et validation ; identifier les risques qualité ; fixer le périmètre. | Fiche projet, cartographie des risques et périmètre de test. |
| **Semaine 2** — Stratégie et plan de test | Définir les niveaux de test (unitaire, intégration, système, acceptation), les environnements, les outils, les responsabilités, les critères d'entrée et de sortie ; préparer le dépôt Git. | Plan de test versionné, organisation du dépôt et calendrier de campagne. |
| **Semaine 3** — Exigences et traçabilité | Examiner les exigences, relever les ambiguïtés, définir des critères d'acceptation vérifiables et construire la matrice exigences–cas de test. | Exigences validées, critères d'acceptation et matrice de traçabilité. |
| **Semaine 4** — Conception des cas de test | Appliquer les partitions d'équivalence, les valeurs limites et les tables de décision ; préparer les tests positifs, négatifs, les scénarios alternatifs et les données. | Catalogue d'au moins 15 cas de test documentés et jeux de données. |
| **Semaine 5** — Transitions d'état et tests exploratoires | Modéliser le cycle de vie d'une réclamation ; tester les transitions autorisées et interdites ; vérifier les droits par rôle ; conduire des tests exploratoires. | Diagramme d'états, scénarios associés et premières fiches d'anomalie. |
| **Semaine 6** — Tests unitaires automatisés | Tester les règles métier et validations ; appliquer Arrange–Act–Assert ; utiliser assertions et, si nécessaire, doubles de test ; analyser les résultats et la couverture. | Au moins 5 tests unitaires automatisés et rapport d'exécution. |
| **Semaine 7** — Tests d'intégration et base de données | Tester les opérations CRUD, la persistance, les contraintes d'intégrité et les cas d'échec ; préparer des données reproductibles. | Au moins 3 tests d'intégration et preuves des résultats obtenus. |
| **Semaine 8** — Tests de l'API REST | Tester les méthodes HTTP, en-têtes, réponses JSON, codes de statut, authentification, autorisations et scénarios négatifs ; automatiser les requêtes. | Collection Postman ou Bruno exécutable et rapport des tests API. |
| **Semaine 9** — Interface et tests non fonctionnels | Automatiser un parcours critique avec Playwright, Cypress ou Selenium ; tester connexion, création et vérification ; effectuer un test de performance, d'accessibilité ou de sécurité ; préparer la régression. | Scénario d'interface automatisé, rapport non fonctionnel et suite de régression. |
| **Semaine 10** — Campagne finale et décision de livraison | Consolider les anomalies et leur sévérité/priorité ; réexécuter les tests après correction ; analyser couverture et risques résiduels ; préparer et défendre la décision de validation. | Dossier final, bilan de campagne et décision argumentée. |

---

## 4. Outils techniques recommandés

Les outils doivent être choisis selon le langage et le framework déjà utilisés par les étudiants. L'objectif est de maîtriser une chaîne cohérente et reproductible, et non de multiplier les outils.

| Besoin | Outil recommandé | Alternative |
|---|---|---|
| Gestion du code | Git + GitHub | GitLab |
| Tests unitaires | Jest ou PHPUnit | JUnit, pytest |
| Tests API REST | Postman | Bruno |
| Tests de l'interface | Playwright | Cypress, Selenium |
| Performance | k6 | JMeter |
| Couverture / analyse statique | Outil de couverture du framework | SonarQube |
| Anomalies et tâches | GitHub Issues / Projects | Jira |
| Intégration continue | GitHub Actions | GitLab CI |

---

## 5. Exigences minimales du projet

| Élément obligatoire | Contenu attendu |
|---|---|
| Plan de test et analyse des risques | Périmètre, niveaux, environnement et priorités. |
| Matrice de traçabilité | Lien entre exigences, risques et cas de test. |
| Au moins 15 cas de test documentés | Tests positifs, négatifs et valeurs limites. |
| Au moins 5 tests unitaires automatisés | Assertions, données et résultats reproductibles. |
| Au moins 3 tests d'intégration | CRUD, persistance et contraintes d'intégrité. |
| Collection de tests API | Requêtes, assertions et résultats attendus. |
| Au moins 1 parcours d'interface automatisé | Parcours critique exécuté de façon reproductible. |
| Au moins 1 test non fonctionnel | Protocole, mesures ou observations et limites. |
| Registre d'anomalies | Étapes de reproduction, sévérité, priorité et preuves. |
| Rapport de couverture et suite de régression | Indicateurs interprétés et tests à rejouer. |
| Bilan et décision finale | Validation, validation conditionnelle ou refus de livraison. |

---

## 6. Barème d'évaluation proposé

| Critère | Points |
|---|---|
| Analyse des exigences et des risques | 10 |
| Pertinence de la stratégie de test | 10 |
| Qualité des cas de test et traçabilité | 15 |
| Tests unitaires | 10 |
| Tests d'intégration et base de données | 10 |
| Tests de l'API REST | 10 |
| Automatisation des tests fonctionnels | 10 |
| Tests non fonctionnels | 5 |
| Gestion des anomalies, couverture et régression | 10 |
| Rapport final et soutenance | 10 |
| **TOTAL** | **100** |

---

## 7. Organisation et modalités de remise

- **Équipe :** binôme recommandé, avec possibilité de travail individuel.
- **Rythme :** une séance hebdomadaire encadrée, complétée par du travail autonome.
- **Gestion du projet :** dépôt Git, tableau Kanban et tâches affectées aux membres.
- **Suivi :** revue hebdomadaire des livrables et démonstration des tests réalisés.
- **Remise finale :** dépôt Git, dossier de test, scripts automatisés, résultats d'exécution, registre des anomalies et rapport final.
- **Soutenance :** démonstration d'un parcours, présentation d'une anomalie significative et justification de la décision de livraison.

---

## 8. Structure du dossier final

1. Présentation du système testé et de son environnement.
2. Exigences, critères d'acceptation et risques identifiés.
3. Stratégie et plan de test.
4. Matrice de traçabilité.
5. Catalogue des cas de test et jeux de données.
6. Scripts automatisés et instructions d'exécution.
7. Résultats d'exécution et preuves pertinentes.
8. Registre des anomalies et état de leur traitement.
9. Indicateurs de couverture et suite de régression.
10. Bilan de la campagne, limites des tests et risques résiduels.
11. Décision de validation et recommandations.

---

## 9. Décision finale de validation : principes

| Décision | Situation typique |
|---|---|
| **Validation** | Exigences critiques couvertes, aucun défaut bloquant connu et critères de sortie satisfaits. |
| **Validation conditionnelle** | Défauts résiduels acceptables, risques explicités et conditions de livraison définies. |
| **Refus de livraison** | Défaut critique, problème de sécurité majeur ou exigence essentielle non satisfaite. |

Les seuils de couverture, les défauts bloquants et les critères de sortie doivent être définis dans le plan de test avant la campagne finale. Un taux de couverture élevé ne garantit pas, à lui seul, l'absence de défauts.

---

## 10. Recommandation pédagogique

Utiliser une seule application support pendant les dix semaines et demander que chaque livrable enrichisse le même dossier de test. Les étudiants comprendront ainsi que le test logiciel est un processus continu de réduction des risques, et non une simple liste de scénarios exécutés à la fin du développement.

> **Point d'attention :** un script écrit mais jamais exécuté ne constitue pas une preuve de validation. Les étudiants doivent présenter les résultats observés, les anomalies détectées et les limites de leurs tests.