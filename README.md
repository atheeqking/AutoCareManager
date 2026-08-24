# AutoCare Manager

AutoCare Manager is a vehicle service and maintenance management system for a single automobile workshop. This repository contains Phase 1 setup plus **Phase 2**: the PostgreSQL domain schema, Flyway migration, JPA entities, and repositories.

Authentication, workflow business logic, business REST APIs, and frontend business screens are intentionally deferred.

## Prerequisites

- Java 21 or later (Java 21 is the project baseline)
- Maven 3.9 or later
- Node.js 20 or later and npm
- PostgreSQL 16+ or Docker Desktop

## Project layout

- `backend/` — Spring Boot REST API, served on port `8080`
- `frontend/` — React + TypeScript + Vite application, served on port `5173`
- `compose.yaml` — optional local PostgreSQL 16 service
- `.env.example` — environment-variable template for PostgreSQL and the frontend API URL

## Run the backend

The default `postgres` profile requires PostgreSQL. Copy the environment template, choose a non-default password before sharing or deploying, and start the database:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
cd backend
$env:DB_URL = "jdbc:postgresql://localhost:5432/autocare_manager"
$env:DB_USERNAME = "autocare"
$env:DB_PASSWORD = "change-me"
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

Flyway applies migrations from `backend/src/main/resources/db/migration` automatically. PostgreSQL uses `ddl-auto=validate`, so Hibernate validates rather than creates the schema.

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
mvn clean verify

cd ../frontend
npm run build
```

## Database design

See [docs/database.md](docs/database.md) for entity descriptions, relationships, constraints, business IDs, and the migration strategy.

Tests use H2 in PostgreSQL compatibility mode. They run the Flyway migration, validate JPA mappings, and verify repository operations and a unique constraint without requiring a running PostgreSQL server.

## Phase 1 and 2 design decisions

- Backend and frontend are separate applications communicating only over REST/JSON.
- APIs use the `/api/v1` prefix; the available endpoint is `GET /api/v1/health`.
- PostgreSQL schema is reproducible from clean databases through Flyway; production-style configurations validate it through Hibernate.
- Security, Swagger/OpenAPI, authentication, and business workflows are intentionally deferred to their specified phases.
