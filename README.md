# AutoCare Manager

AutoCare Manager is a vehicle service and maintenance management system for a single automobile workshop. This repository currently contains **Phase 1**: independent Spring Boot and React application setup, PostgreSQL configuration, and a basic health API and landing page.

No authentication, business modules, database entities, or mock business data are implemented in this phase.

## Prerequisites

- Java 21 or later (Java 21 is the project baseline)
- Maven 3.9 or later
- Node.js 20 or later and npm
- PostgreSQL 16+ or Docker Desktop (optional for the default local API profile)

## Project layout

- `backend/` — Spring Boot REST API, served on port `8080`
- `frontend/` — React + TypeScript + Vite application, served on port `5173`
- `compose.yaml` — optional local PostgreSQL 16 service
- `.env.example` — environment-variable template for PostgreSQL and the frontend API URL

## Run the backend

The default `local` profile starts the Phase 1 API without a database because no entities exist yet:

```powershell
cd backend
mvn spring-boot:run
```

Check the API:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
```

Expected response:

```json
{
  "status": "UP",
  "service": "AutoCare Manager API"
}
```

### Run with PostgreSQL

Copy the environment template and set a non-default password before sharing or deploying:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
```

Then start the backend using its PostgreSQL profile:

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE = "postgres"
$env:DB_URL = "jdbc:postgresql://localhost:5432/autocare_manager"
$env:DB_USERNAME = "autocare"
$env:DB_PASSWORD = "change-me"
mvn spring-boot:run
```

The PostgreSQL profile uses `ddl-auto=validate`; Phase 2 will introduce the database entities and migrations/schema.

## Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

To configure the frontend API URL, copy `.env.example` to `frontend/.env` and retain or update `VITE_API_BASE_URL`:

```powershell
Copy-Item .env.example frontend/.env
```

Build the frontend for production:

```powershell
cd frontend
npm run build
```

## Validation commands

```powershell
cd backend
mvn test

cd ../frontend
npm run build
```

## Phase 1 design decisions

- Backend and frontend are separate applications communicating only over REST/JSON.
- APIs use the `/api/v1` prefix; the available endpoint is `GET /api/v1/health`.
- PostgreSQL is configured as an explicit profile to keep the initial health API runnable before Phase 2 entity work.
- Security, Swagger/OpenAPI, authentication, and business workflows are intentionally deferred to their specified phases.
