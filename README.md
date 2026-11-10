# E-Commerce & Reviews DevOps Project

A full-stack, enterprise-grade web application built to fulfill all DevOps and Software Engineering requirements.

---

## Project Requirements Checklist

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Web Interface (Frontend) & Backend/API** | **Frontend**: React 19 + TypeScript + Vite (`frontend/`)<br>**Backend**: NestJS REST API + Swagger (`src/`) |  Completed |
| **Database** | PostgreSQL with TypeORM ORM, migrations, and Docker Compose setup (`db/`, `docker-compose.yml`) |  Completed |
| **Authentication & User Management** | JWT auth, bcrypt password hashing, roles (`admin` & `user`), registration, login, profile management, and image upload |  Completed |
| **Business Feature 1** | **Product Catalog & Management**: Search, filter by price, full admin CRUD, product detail view |  Completed |
| **Business Feature 2** | **Product Reviews & Rating System**: 1–5 star ratings, customer feedback comments, ownership check, admin moderation |  Completed |
| **Automated Testing** | 53 unit tests in Jest covering auth, users, products, and reviews; plus e2e test specifications |  Completed |

---

## Architecture Overview

```
devops/course/
├── src/                          # NestJS Backend API
│   ├── users/                    # Authentication & User Management
│   │   ├── auth.provider.ts      # JWT generation, bcrypt hashing
│   │   ├── users.controller.ts   # REST endpoints (/api/users)
│   │   ├── users.service.ts      # User business logic
│   │   └── user.entity.ts        # TypeORM entity
│   ├── products/                 # Business Feature 1: Products
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── product.entity.ts
│   ├── reviews/                  # Business Feature 2: Reviews & Ratings
│   │   ├── reviews.controller.ts
│   │   ├── reviews.service.ts
│   │   └── review.entity.ts
│   ├── uploads/                  # Profile image upload module
│   └── mail/                     # Email notification module
├── frontend/                     # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── pages/                # LoginPage, RegisterPage, ProductsPage, ProductDetailPage
│   │   ├── AuthContext.tsx       # Authentication state management
│   │   ├── Navbar.tsx            # Navigation bar with role indicators
│   │   ├── api.ts                # Fetch client with Bearer token injection
│   │   └── types.ts              # Strongly-typed data models
│   ├── index.html
│   └── vite.config.ts
├── db/                           # TypeORM data source & migrations
├── docker-compose.yml            # PostgreSQL container configuration
└── test/                         # E2E test suites
```

---

## Getting Started

### 1. Start the Database
You can spin up PostgreSQL using Docker:
```bash
docker-compose up -d
```
Or use a local PostgreSQL instance configured in `.env.development`:
- Host: `localhost:5432`
- Database: `nestlearn`
- User: `postgres`
- Password: `admin`

### 2. Install Dependencies & Build
Install backend and frontend dependencies:
```bash
# In course/ directory:
npm install

# Build both backend and frontend:
npm run build:all
```

### 3. Run the Backend API
```bash
npm run start:dev
```
- API URL: `http://localhost:3000/api`
- Interactive Swagger Documentation: `http://localhost:3000/swagger`

### 4. Run the Frontend Web Application
```bash
npm run start:frontend
# or: cd frontend && npm run dev
```
- Frontend Web App: `http://localhost:3001`

---

## Running Automated Tests

Run the full suite of 53 unit tests:
```bash
npm test
```

Generate test coverage report:
```bash
npm run test:cov
```

Run end-to-end tests:
```bash
npm run test:e2e
```
