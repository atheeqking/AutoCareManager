# AutoCare Manager

AutoCare Manager is a vehicle service and maintenance management system for a single automobile workshop. This repository contains Phase 1 setup plus **Phase 2**: the PostgreSQL domain schema, Flyway migration, JPA entities, and repositories.

Phase 3 adds authentication and authorization. Phase 4 adds customer and vehicle management. Phase 5 adds appointment requests, controlled appointment check-in, and workshop walk-ins.

Phases 6 and 7 add the workshop service-case workflow through `READY_FOR_PICKUP`: assignment, priority, diagnosis, workshop notes, solution/work performed, and service items. Delivery, completion, payment processing, notifications, and history remain deferred.

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

## Authentication architecture

Workshop users authenticate locally with a username and BCrypt password hash. The API returns a short-lived signed JWT; the React client sends it as `Authorization: Bearer <token>`. `/api/v1/auth/me` derives identity from the security context rather than a client-provided user ID.

Roles are `CUSTOMER`, `EMPLOYEE`, `MANAGER`, and `OWNER`; workshop access is hierarchical (`OWNER` includes manager and employee access). Guest sessions receive a signed temporary token with only the `GUEST` authority, so they cannot access customer-private or workshop routes. `CurrentUserService` is the ownership-aware foundation later APIs must use.

Google OAuth is optional. With the `google` profile enabled, a verified Google email finds or creates one `GOOGLE` `CUSTOMER` user and the app redirects to the frontend with a JWT in the URL fragment. No Google user is duplicated by email. A customer profile is intentionally deferred until Phase 4 because required customer contact data is not supplied by Google.

The frontend stores only the access token and user summary in `localStorage` for this mini-project; this makes Axios authentication simple but has the usual XSS tradeoff. It never stores passwords. A production-grade implementation would normally prefer an HttpOnly cookie strategy.

## Demo workshop users

Flyway V2 seeds these development-only accounts. The password is `password` and the stored value is a BCrypt hash:

- `owner@autocare.com` — OWNER
- `manager@autocare.com` — MANAGER
- `employee@autocare.com` — EMPLOYEE

Change or remove these accounts for any non-demo deployment.

## Environment

Copy `.env.example` and set these values in the environment used to start the applications: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (32+ characters), `JWT_EXPIRATION`, and `FRONTEND_URL`. `VITE_API_BASE_URL` and `VITE_BACKEND_URL` configure the frontend. CORS permits only `FRONTEND_URL`, defaulting to `http://localhost:5173`.

## Run the backend

The default `postgres` profile requires PostgreSQL. Copy the environment template, choose a non-default password before sharing or deploying, and start the database:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
cd backend
$env:DB_URL = "jdbc:postgresql://localhost:5433/autocare_manager"
$env:DB_USERNAME = "autocare"
$env:DB_PASSWORD = "password"
mvn spring-boot:run
```

## Optional Google OAuth

Google is disabled by default, so local workshop login and guest access run without Google credentials. Create a Google OAuth web client with the redirect URI `http://localhost:8080/login/oauth2/code/google` (adjust the host for deployment), then set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Start Spring with the Google profile:

```powershell
$env:SPRING_PROFILES_ACTIVE = "postgres,google"
$env:GOOGLE_CLIENT_ID = "your-client-id"
$env:GOOGLE_CLIENT_SECRET = "your-client-secret"
$env:FRONTEND_URL = "http://localhost:5173"
mvn spring-boot:run
```

Set `VITE_GOOGLE_LOGIN_ENABLED=true` in `frontend/.env` only for that configured environment.

## Authentication API

- `POST /api/v1/auth/login` — public workshop login (`username`, `password`), returning `{ accessToken, tokenType, user }`; invalid credentials return 401.
- `POST /api/v1/auth/guest` — public limited guest entry point.
- `GET /api/v1/auth/me` — Bearer-authenticated current identity.

Swagger UI is available at `/swagger-ui/index.html`. The Phase 3 `/api/v1/access/**` endpoints are authorization probes used by tests, not business APIs.

## Customer and vehicle API

- `POST`, `GET /api/v1/customers` — create or search customers. Search is restricted to workshop roles.
- `GET`, `PUT /api/v1/customers/{customerId}` — retrieve or update a customer.
- `GET /api/v1/customers/me` — authenticated customer profile.
- `GET`, `POST /api/v1/customers/{customerId}/vehicles` — list and create customer vehicles.
- `GET`, `PUT /api/v1/vehicles/{vehicleId}` — vehicle detail and update.

Customer access is determined from the JWT security context and the `Customer.user` association; a customer cannot access another customer's records. Workshop roles may manage records, while guests are denied. V3 uses database sequences to generate stable `CUS-000001` and `VEH-000001` business IDs, and license plates remain unique.

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

Authentication integration tests additionally cover local login, BCrypt hashing, JWT generation and validation, missing/invalid tokens, guest restrictions, role hierarchy, and customer/workshop separation. Google user logic is deliberately isolated behind `GoogleOAuthUserService`; it does not require a live Google account during tests.

## Phase 1 and 2 design decisions

- Backend and frontend are separate applications communicating only over REST/JSON.
- APIs use the `/api/v1` prefix; the available endpoint is `GET /api/v1/health`.
- PostgreSQL schema is reproducible from clean databases through Flyway; production-style configurations validate it through Hibernate.
- JWT security, optional Google OAuth2, Swagger/OpenAPI, and auth routing are implemented in Phase 3. Business workflows remain deferred.
