# Lot 5 – Configurations, Secrets & DevSecOps Report

## 1. Configuration Matrix (Development vs Test vs Production/Docker)

The application separates runtime environments via `NODE_ENV` (configured in `src/app.module.ts`) and externalizes all sensitive or environment-specific parameters into environment variables or CI/CD credentials.

| Variable | Development (`.env.development`) | Test (`.env.test`) | Production / Docker (`.env` or CI/CD) | Sensitive? |
| :--- | :--- | :--- | :--- | :---: |
| `NODE_ENV` | `development` | `test` | `production` | No |
| `PORT` | `3000` | `3000` | `3000` | No |
| `DB_HOST` | `localhost` | `127.0.0.1` | `db` (Docker service) | No |
| `DB_PORT` | `5433` | `5433` | `5432` (internal Docker port) | No |
| `DB_USERNAME` | `postgres` | `postgres` | `${DB_USERNAME}` | No |
| `DB_PASSWORD` | Local dev password (`.env.development`) | Test DB password (Jenkins `db-password-test`) | `${DB_PASSWORD}` (required, no default) | **Yes** |
| `DATABASE` / `DB_DATABASE` | `nestlearn` | `nestlearn_test` | `nestlearn` | No |
| `JWT_SECRET` | Local dev secret (`.env.development`) | Test secret (Jenkins `jwt-secret-test`) | `${JWT_SECRET}` (required, no default) | **Yes** |
| `JWT_EXPIRES_IN` | `1d` | `1d` | `1d` | No |
| `SMTP_HOST` | `sandbox.smtp.mailtrap.io` | `sandbox.smtp.mailtrap.io` | SMTP provider host | No |
| `SMTP_PORT` | `2525` | `2525` | `587` / `465` / `2525` | No |
| `SMTP_USERNAME` | Local Mailtrap user | Test Mailtrap user | `${SMTP_USERNAME}` | **Yes** |
| `SMTP_PASSWORD` | Local Mailtrap pass | Test Mailtrap pass | `${SMTP_PASSWORD}` | **Yes** |
| `DOMAIN` | `http://localhost:3000` | `http://localhost:3000` | Public API URL | No |
| `CLIENT_URL` | `http://localhost:3001` | `http://localhost:3001` | Public Frontend URL (`http://localhost`) | No |
| `PGADMIN_DEFAULT_EMAIL` | N/A | N/A | `${PGADMIN_DEFAULT_EMAIL}` (required) | No |
| `PGADMIN_DEFAULT_PASSWORD` | N/A | N/A | `${PGADMIN_DEFAULT_PASSWORD}` (required) | **Yes** |

---

## 2. Secret Management & Externalization

### 2.1 Version Control Hygiene (`.gitignore` & `.env.example`)
- All environment files (`.env`, `.env.development`, `.env.test`, `.env.*.local`) are excluded in `.gitignore`.
- Verified via `git ls-files .env*`: **0 environment files are tracked in Git**.
- A safe template [`.env.example`](../.env.example) with placeholder values is committed to guide developers without exposing credentials.

### 2.2 Docker Compose Externalization
In [`docker-compose.yml`](../docker-compose.yml), all hardcoded passwords, JWT keys, and SMTP credentials were removed and replaced with required environment variable substitutions (`${VAR:?error_message}`):
- `POSTGRES_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD must be set in .env or environment}`
- `JWT_SECRET=${JWT_SECRET:?JWT_SECRET must be set in .env or environment}`
- `PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD:?PGADMIN_DEFAULT_PASSWORD must be set in .env or environment}`
- `NODE_ENV` defaults to `production` (`${NODE_ENV:-production}`) instead of `development`.

### 2.3 Jenkins CI/CD Secret Management
In [`Jenkinsfile`](../Jenkinsfile), sensitive values are injected securely at runtime using Jenkins' `withCredentials` binding (backed by **Manage Jenkins > Credentials**):
```groovy
withCredentials([
    string(credentialsId: 'jwt-secret-test', variable: 'JWT_SECRET'),
    string(credentialsId: 'db-password-test', variable: 'DB_PASSWORD')
]) {
    sh 'NODE_ENV=test npx jest --runInBand'
}
```
Jenkins automatically masks these values (`****`) in build console logs.

---

## 3. DevSecOps Security Controls & Audit Report

### 3.1 Automated Pipeline Checks (`Jenkinsfile`)
The `DevSecOps - Security Checks` stage in [`Jenkinsfile`](../Jenkinsfile) runs on every build:
1. **Secret Detection**:
   - Verifies no `.env` files are tracked in Git (`git ls-files`).
   - Scans tracked source files (`git grep`) for hardcoded secret assignments (`JWT_SECRET`, `DB_PASSWORD`, `SMTP_PASSWORD`, `PGADMIN_DEFAULT_PASSWORD`).
2. **Dependency Vulnerability Analysis (`npm audit`)**:
   - Runs `npm audit --omit=dev --audit-level=critical` on both the NestJS backend and React frontend.
   - Exports JSON reports to `security-reports/backend-audit.json` and `security-reports/frontend-audit.json` and archives them as pipeline artifacts.

### 3.2 Vulnerability Scan Results & Corrective Actions

#### Frontend (`frontend/`)
- Command: `npm audit --omit=dev`
- Result: **0 vulnerabilities found** (no action required).

#### Backend (Root `package.json`)
- **Initial Scan (`npm audit --omit=dev`)**:
  - **52 vulnerabilities total**: **2 critical**, **14 high**, **36 moderate**.
  - Key critical/high findings included `proxy-addr` (IP spoofing via IPv4-mapped IPv6), `body-parser` (DoS), `undici` (DoS / TLS bypass), `brace-expansion` (DoS), `svgo` (SVG sanitization bypass), and `source-map-js` (DoS).
- **Corrective Action Taken**:
  - Executed `npm audit fix` (non-breaking dependency updates) and upgraded `nodemailer` to `^10.6.1` (`npm install nodemailer@latest`), then re-verified `npm run build` and all **71/71 unit tests**.
- **Post-Remediation Scan (`npm audit --omit=dev`)**:
  - **34 vulnerabilities remaining**: **0 critical**, **0 high**, **34 moderate**.
  - **Critical vulnerabilities reduced from 2 → 0**; **high vulnerabilities reduced from 14 → 0**.

#### Justification for Remaining Unfixed Alerts
| Package | Severity | Reason Not Upgraded Automatically | Mitigation / Decision |
| :--- | :---: | :--- | :--- |
| `glob` / `minimatch` (via `@nestjs-modules/mailer` / `mjml`) | **Moderate** | Fix requires `npm audit fix --force`, downgrading `@nestjs-modules/mailer` from `2.3.7` to `1.8.1` (breaking change incompatible with current `EjsAdapter` import and NestJS 11). | Accepted; `mjml` template compilation runs only on trusted internal `.ejs` templates, not untrusted user input. |
