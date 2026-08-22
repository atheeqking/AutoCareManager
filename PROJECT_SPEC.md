# AutoCare Manager — Project Development Specification

You are a senior full-stack software engineer and solution architect.

You are responsible for designing and implementing a production-quality but appropriately scoped academic mini-project called "AutoCare Manager".

The application is a Vehicle Service & Maintenance Management System for a SINGLE automobile workshop.

The project must be simple enough for a B.E. Computer Science final-year mini-project, but the implementation should follow clean software engineering practices so that the project can later be extended into a production application and mobile application.

==================================================
1. PROJECT OBJECTIVE
==================================================

Build a web application that digitizes the vehicle service process of an automobile workshop.

The application must solve these real-world problems:

1. Customers arrive without proper service records.
2. Workshops have difficulty prioritizing vehicles.
3. Vehicle issues and their solutions are often not documented properly.
4. Previous service history is difficult to find.
5. Workshop employees have difficulty tracking the current status of vehicles.
6. Customers do not know whether their vehicle is ready for pickup.
7. Paper-based records are difficult to maintain.

The application should maintain a complete digital history for each vehicle:

Vehicle
    ->
Service Visit
    ->
Customer Complaint
    ->
Diagnosis
    ->
Solution
    ->
Service Details
    ->
Ready for Pickup
    ->
Delivered
    ->
Completed
    ->
Permanent Service History


==================================================
2. IMPORTANT SCOPE DECISIONS
==================================================

The following decisions are FINAL for the initial MVP.

Workshop model:
- SINGLE WORKSHOP ONLY.
- Do NOT implement multi-workshop/multi-tenant architecture.

Service entry:
- WALK-IN
- APPOINTMENT

Service creation:
- Customer can create an appointment.
- Customer can create a service request as a guest.
- Workshop employee can create a walk-in.
- Workshop employee can also create an appointment/service case.

Payment:
- DO NOT implement real payment processing.
- DO NOT integrate Stripe or any payment gateway.
- Payment is a future enhancement.
- The current workflow can contain PAYMENT_PENDING as a status.

Notifications:
- DO NOT integrate real SMS.
- DO NOT integrate Twilio.
- Implement SIMULATED notifications inside the application.
- When a vehicle becomes READY_FOR_PICKUP, create an in-app notification for the customer.

Mobile:
- DO NOT build the mobile application now.
- The backend must be REST API based and mobile-ready.
- A future React Native application should be able to consume the same APIs.

AI:
- DO NOT add AI features.
- Do not add AI diagnosis.
- Do not add unnecessary machine learning.

Security:
- Implement normal application authentication and authorization.
- This is NOT a cybersecurity project.
- Do not add unnecessary security features that increase complexity.


==================================================
3. TECHNOLOGY STACK
==================================================

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Zod or equivalent validation library if useful

Backend:
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- Bean Validation
- Maven

Database:
- PostgreSQL

Authentication:
- Spring Security
- Google OAuth2 for registered customers
- Username/password authentication for workshop users

API:
- REST
- JSON
- Version APIs using /api/v1

Documentation:
- OpenAPI / Swagger

Testing:
- JUnit
- Mockito
- Spring Boot Test
- API tests
- Frontend tests where practical

Code quality:
- Clean architecture
- SOLID principles where appropriate
- Meaningful naming
- No unnecessary abstraction
- No over-engineering


==================================================
4. ARCHITECTURE
==================================================

Use the following high-level architecture:

React + TypeScript
        |
        | REST/JSON
        |
Spring Boot REST API
        |
        +---- Spring Security
        |
        +---- Business Services
        |
        +---- JPA Repositories
        |
        +---- PDF Generation
        |
        |
PostgreSQL

The backend must be independent of the frontend.

Do not put business logic in React.

Do not expose JPA entities directly from APIs.

Use DTOs for API request/response models.

Use service classes for business logic.

Use repositories only for data access.


==================================================
5. USER ROLES
==================================================

There are two major user categories.

CUSTOMER:
- Guest
- Registered customer

WORKSHOP:
- EMPLOYEE
- MANAGER
- OWNER

Permissions:

CUSTOMER:
- View own vehicles
- Add vehicle
- Create appointment
- Create guest service request
- View own active service cases
- View own service history
- View notifications

EMPLOYEE:
- Create customers
- Create vehicles
- Create walk-in cases
- Create appointments
- View appointments
- View service cases
- Update service status
- Set service priority
- Record diagnosis
- Record solution
- Record service details
- Mark ready for pickup
- Mark delivered
- View vehicle history

MANAGER:
- Everything EMPLOYEE can do
- View workshop dashboard
- View all service cases
- Manage employees
- Monitor workload

OWNER:
- Everything MANAGER can do
- Manage workshop configuration
- Manage employees

For the MVP, MANAGER and OWNER may have similar permissions.


==================================================
6. CUSTOMER MANAGEMENT
==================================================

Customer fields:

- customerId
- name
- phone
- email
- authentication type
- createdAt
- updatedAt

Mandatory:
- Name
- Phone

Email is optional for guest customers.

A customer can own multiple vehicles.


==================================================
7. VEHICLE MANAGEMENT
==================================================

Vehicle fields:

- vehicleId
- customerId
- make
- model
- year
- color
- licensePlate
- vin
- currentMileage
- createdAt
- updatedAt

Mandatory:
- Make
- Model
- Color
- License Plate

Optional:
- Year
- VIN
- Mileage

Vehicle ID must be system generated.

Example:

VEH-000125

A vehicle ID is permanent.

Do NOT generate a new vehicle ID for every service visit.

Use the existing vehicle record if the same vehicle returns.


==================================================
8. SERVICE CASE
==================================================

Every service visit must create a Service Case.

Example:

SRV-2026-001245

A Service Case belongs to:
- One customer
- One vehicle
- One workshop

Service Case fields should include:

- serviceCaseId
- vehicleId
- customerId
- appointmentId if applicable
- visitType
- serviceType
- issueDescription
- priority
- status
- checkInTime
- diagnosis
- solution
- technicianNotes
- createdBy
- assignedEmployee if applicable
- readyForPickupAt
- deliveredAt
- completedAt
- createdAt
- updatedAt


==================================================
9. VISIT TYPES
==================================================

VISIT_TYPE:

WALK_IN
APPOINTMENT

Walk-in:
- Created directly by workshop employee.
- Customer and vehicle information must be captured.

Appointment:
- Created by customer or employee.
- Contains requested date/time.
- When customer arrives, appointment can become CHECKED_IN.


==================================================
10. SERVICE TYPES
==================================================

SERVICE_TYPE:

GENERAL_MAINTENANCE
SPECIFIC_ISSUE
BOTH

Examples:

GENERAL_MAINTENANCE:
- Oil change
- Filter replacement
- Regular inspection

SPECIFIC_ISSUE:
- Engine noise
- Brake issue
- AC issue
- Battery problem

BOTH:
- General maintenance plus specific issue.


==================================================
11. PRIORITY
==================================================

Priority values:

CRITICAL
HIGH
NORMAL
LOW

Examples:

CRITICAL:
- Brake failure
- Vehicle unsafe to operate

HIGH:
- Engine overheating
- Major mechanical issue

NORMAL:
- Regular maintenance

LOW:
- Interior cleaning

The workshop dashboard must make priority visible.

Higher-priority cases should appear first.


==================================================
12. SERVICE STATUS
==================================================

Primary workflow:

APPOINTMENT
    ->
CHECKED_IN
    ->
DIAGNOSIS
    ->
WAITING_FOR_APPROVAL
    ->
IN_SERVICE
    ->
PAYMENT_PENDING
    ->
READY_FOR_PICKUP
    ->
DELIVERED
    ->
COMPLETED

Additional statuses:

CANCELLED
ON_HOLD

For WALK_IN cases:

WALK_IN
    ->
CHECKED_IN
    ->
DIAGNOSIS
    ->
...

Business rules must prevent invalid status transitions.

Example:

A COMPLETED case cannot return to IN_SERVICE.

A case cannot become COMPLETED before DELIVERED.


==================================================
13. CUSTOMER ISSUE
==================================================

The system must record the customer's reported issue.

Example:

"Car makes a strange noise while braking."

Fields:

- issueDescription
- additionalNotes
- reportedAt
- reportedBy


==================================================
14. DIAGNOSIS
==================================================

Workshop employee/technician records:

- diagnosis
- technician notes

Example:

Customer issue:
"Brake noise"

Diagnosis:
"Front brake pads are worn."


==================================================
15. SOLUTION
==================================================

Workshop employee records:

- solution
- work performed
- technician notes

Example:

Diagnosis:
"Worn front brake pads."

Solution:
"Replaced front brake pads."

This information MUST remain permanently available in the vehicle service history.


==================================================
16. SERVICE ITEMS
==================================================

The employee may record services performed.

Examples:

- Oil change
- Brake inspection
- Filter replacement
- Tire rotation

For MVP:
- Store service item name
- Description
- Quantity if useful

DO NOT implement complex inventory management.


==================================================
17. APPOINTMENT
==================================================

Appointment fields:

- appointmentId
- customerId
- vehicleId
- requestedDate
- requestedTime
- serviceType
- issueDescription
- priority
- status
- createdAt
- updatedAt

Appointment statuses can include:

REQUESTED
CONFIRMED
CHECKED_IN
CANCELLED
NO_SHOW
COMPLETED

For MVP, keep appointment workflow simple.


==================================================
18. CONFIRMATION BEFORE SUBMISSION
==================================================

Before creating an appointment or walk-in service case:

Display a confirmation screen.

Example:

Customer:
John Smith
555-123-4567

Vehicle:
Toyota Camry
Blue
ABC-1234

Visit:
Walk-in

Service:
General Maintenance

Issue:
Oil change and brake inspection

Buttons:

EDIT
CONFIRM & CREATE

Only create the actual Service Case after confirmation.


==================================================
19. UNIQUE ID GENERATION
==================================================

Vehicle:

VEH-000001
VEH-000002
VEH-000003

Service Case:

SRV-2026-000001
SRV-2026-000002

IDs must be unique.

Do not rely only on frontend-generated IDs.

The backend must be responsible for generating or validating unique identifiers.


==================================================
20. PRINTABLE SERVICE DOCUMENT
==================================================

After creating a service case, provide:

PRINT
DOWNLOAD PDF

The PDF/document should contain:

- Workshop name
- Service Case ID
- Vehicle ID
- Customer name
- Customer phone
- Vehicle make
- Vehicle model
- Vehicle color
- License plate
- Visit type
- Service type
- Issue
- Date/time
- Customer signature area
- Workshop representative signature area

Do not implement electronic signature functionality.

For MVP, provide blank signature lines.

Example:

Customer Signature:
________________________

Workshop Representative:
________________________


==================================================
21. SERVICE COMPLETION
==================================================

When the employee finishes the service:

1. Enter diagnosis.
2. Enter solution.
3. Enter service items.
4. Enter technician notes.
5. Update service status.
6. Move case toward READY_FOR_PICKUP.

Payment is NOT processed.

Payment can remain PAYMENT_PENDING.


==================================================
22. READY FOR PICKUP
==================================================

Employee selects:

MARK READY FOR PICKUP

System must:

1. Validate that required service information exists.
2. Change status to READY_FOR_PICKUP.
3. Record readyForPickupAt.
4. Create an in-app notification.


==================================================
23. SIMULATED NOTIFICATION
==================================================

Notification example:

"Your Toyota Camry (ABC-1234) is ready for pickup.

Service Case: SRV-2026-001245."

Notification fields:

- notificationId
- customerId
- serviceCaseId
- title
- message
- type
- read
- createdAt

No real SMS integration.


==================================================
24. VEHICLE DELIVERY
==================================================

Employee selects:

MARK DELIVERED

System records:

- deliveredAt
- deliveredBy

Then status becomes:

COMPLETED


==================================================
25. VEHICLE SERVICE HISTORY
==================================================

Every completed Service Case must remain available in the vehicle history.

Example:

Toyota Camry
ABC-1234
VEH-000125

History:

August 9, 2026
Brake Service

Issue:
Brake noise

Diagnosis:
Worn brake pads

Solution:
Brake pads replaced

---

May 10, 2026
General Maintenance

Solution:
Oil and filter replaced

The history must be chronological, newest first.


==================================================
26. WORKSHOP DASHBOARD
==================================================

Dashboard should display:

- Today's appointments
- Today's walk-ins
- Vehicles currently in service
- Waiting for approval
- Ready for pickup
- High-priority cases
- Completed cases

Service case table:

- Case ID
- Customer
- Vehicle
- License plate
- Service type
- Priority
- Status
- Created date

Support filtering by:
- Status
- Priority
- Date
- Customer
- License plate


==================================================
27. CUSTOMER DASHBOARD
==================================================

Customer dashboard:

MY VEHICLES

ACTIVE SERVICES

SERVICE HISTORY

NOTIFICATIONS

Example:

Toyota Camry
ABC-1234

Current Service:
SRV-2026-001245

Status:
IN_SERVICE


==================================================
28. AUTHENTICATION
==================================================

Customer:
- Guest
- Google OAuth2

Workshop:
- Username/password

Use Spring Security.

Passwords must never be stored as plain text.

Use appropriate password hashing.

Implement role-based authorization.

Do not implement unnecessary security complexity.


==================================================
29. DATABASE
==================================================

Initial entities/tables should include:

users
customers
employees
vehicles
appointments
service_cases
service_issues
diagnoses
service_items
notifications

Payments should NOT be implemented in MVP.

Avoid unnecessary tables.

Use proper foreign keys.

Use timestamps.

Use database constraints where appropriate.


==================================================
30. BACKEND PACKAGE STRUCTURE
==================================================

Use a clean Spring Boot structure:

com.autocare
|
+-- config
+-- controller
+-- dto
|   +-- request
|   +-- response
+-- entity
+-- enums
+-- exception
+-- mapper
+-- repository
+-- security
+-- service
|   +-- impl
+-- util

Keep controllers thin.

Business logic belongs in services.

Repositories only handle persistence.


==================================================
31. FRONTEND STRUCTURE
==================================================

Use a clean React structure:

src/
|
+-- components/
+-- pages/
|   +-- auth/
|   +-- customer/
|   +-- workshop/
|   +-- vehicles/
|   +-- appointments/
|   +-- service-cases/
|   +-- notifications/
|
+-- services/
+-- hooks/
+-- types/
+-- utils/
+-- layouts/
+-- routes/
+-- validators/


==================================================
32. API DESIGN
==================================================

Use REST APIs under:

/api/v1

Expected API groups:

/api/v1/auth
/api/v1/customers
/api/v1/vehicles
/api/v1/appointments
/api/v1/service-cases
/api/v1/notifications
/api/v1/employees

Examples:

POST   /api/v1/appointments
GET    /api/v1/appointments
GET    /api/v1/appointments/{id}
PUT    /api/v1/appointments/{id}
DELETE /api/v1/appointments/{id}

POST /api/v1/service-cases/walk-in
GET  /api/v1/service-cases
GET  /api/v1/service-cases/{id}
PUT  /api/v1/service-cases/{id}/status
PUT  /api/v1/service-cases/{id}/priority
POST /api/v1/service-cases/{id}/diagnosis
POST /api/v1/service-cases/{id}/solution
POST /api/v1/service-cases/{id}/ready-for-pickup
POST /api/v1/service-cases/{id}/delivered

GET /api/v1/vehicles/{id}/history

GET /api/v1/notifications


==================================================
33. VALIDATION
==================================================

Frontend validation:
- Required fields
- Phone format
- License plate
- Date/time
- User-friendly validation messages

Backend validation:
- Mandatory fields
- Valid enum values
- Valid status transitions
- Authorization
- Duplicate vehicle detection where appropriate

Never rely only on frontend validation.


==================================================
34. ERROR HANDLING
==================================================

Implement centralized backend exception handling.

Use meaningful HTTP status codes.

Examples:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error

Return consistent error responses.

Example:

{
  "timestamp": "...",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "License plate is required"
}


==================================================
35. LOGGING
==================================================

Use appropriate application logging.

Log:
- Important service operations
- Authentication events where appropriate
- Errors
- Status changes

Do NOT log passwords, tokens, or sensitive authentication information.


==================================================
36. TESTING
==================================================

At minimum implement tests for:

1. Vehicle creation
2. Duplicate/invalid vehicle data
3. Service Case creation
4. Walk-in creation
5. Appointment creation
6. Service status transitions
7. Priority updates
8. Diagnosis creation
9. Solution creation
10. Ready-for-pickup workflow
11. Delivery/completion
12. Vehicle service history
13. Authorization rules

Focus tests on business logic rather than chasing arbitrary coverage percentages.


==================================================
37. API DOCUMENTATION
==================================================

Provide Swagger/OpenAPI documentation.

Every important API should document:

- HTTP method
- Endpoint
- Request body
- Response
- Error responses
- Authentication requirements


==================================================
38. UI/UX REQUIREMENTS
==================================================

The UI should be:

- Clean
- Modern
- Responsive
- Desktop-friendly
- Mobile-responsive

Workshop dashboard should prioritize operational information.

Use clear status badges.

Example:

CRITICAL
HIGH
NORMAL
LOW

Use clear service status indicators.

Do not over-design.

Do not add animations unless they improve usability.


==================================================
39. MOBILE-READY REQUIREMENT
==================================================

The backend MUST NOT depend on browser-specific functionality.

All business operations should be exposed through REST APIs.

The frontend must consume APIs through a service layer.

Do not directly access the database from the frontend.

Future React Native application should be able to reuse the same backend APIs.


==================================================
40. MVP OUT OF SCOPE
==================================================

Do NOT implement:

- Multiple workshops
- Online payment
- Stripe
- Twilio
- Real SMS
- Real email service
- AI diagnosis
- Machine learning
- GPS
- Vehicle IoT
- Insurance integration
- Parts inventory
- Accounting
- Complex financial reporting
- Advanced analytics
- Native mobile app


==================================================
41. DEVELOPMENT APPROACH
==================================================

Do NOT attempt to generate the entire application in one step.

Implement incrementally.

Recommended order:

PHASE 1:
Project setup
- Backend
- Frontend
- PostgreSQL
- Git
- Basic README

PHASE 2:
Database + entities
- Users
- Customers
- Employees
- Vehicles

PHASE 3:
Authentication
- Workshop login
- Customer guest access
- Google OAuth2
- Roles

PHASE 4:
Vehicle/customer management

PHASE 5:
Appointments

PHASE 6:
Walk-in service cases

PHASE 7:
Service workflow
- Diagnosis
- Solution
- Priority
- Status

PHASE 8:
Vehicle history

PHASE 9:
PDF generation

PHASE 10:
Notifications

PHASE 11:
Dashboard

PHASE 12:
Testing
- Backend tests
- API tests
- Frontend tests

PHASE 13:
Documentation
- README
- Architecture diagram
- ER diagram
- API documentation
- Setup instructions


==================================================
42. CODING AGENT RULES
==================================================

Before writing code:

1. Inspect the existing repository.
2. Understand existing files.
3. Do not overwrite existing work unnecessarily.
4. Create a short implementation plan.
5. Identify dependencies.
6. Identify database changes.
7. Implement one logical feature at a time.
8. Run tests after meaningful changes.
9. Fix compilation/test errors before moving forward.
10. Keep documentation updated.

Do not generate fake implementations.

Do not create TODO placeholders for core MVP functionality.

Do not silently change requirements.

If a requirement is ambiguous, explain the ambiguity and make the smallest reasonable assumption.

Do not introduce libraries unless they are actually needed.

Prefer simple solutions over complex abstractions.


==================================================
43. GIT / COMMIT STRATEGY
==================================================

Use logical commits.

Examples:

feat: initialize spring boot backend
feat: initialize react frontend
feat: add customer and vehicle management
feat: add workshop authentication
feat: add appointment workflow
feat: add walk-in service cases
feat: add service status workflow
feat: add vehicle service history
feat: add printable service document
feat: add simulated notifications
test: add service case workflow tests
docs: add architecture and setup documentation


==================================================
44. DEFINITION OF DONE
==================================================

A feature is considered complete only when:

- Backend implementation exists.
- Frontend implementation exists where required.
- Database changes are complete.
- Validation exists.
- Authorization exists where required.
- Error handling exists.
- Tests exist for important business logic.
- API is documented.
- Application compiles.
- Tests pass.
- README/setup instructions are updated.


==================================================
45. FINAL DEMO SCENARIO
==================================================

The application should support the following complete demonstration:

1. Customer opens AutoCare Manager.
2. Customer logs in with Google OR continues as Guest.
3. Customer selects/adds a Toyota Camry.
4. Customer enters license plate ABC-1234.
5. Customer selects General Maintenance.
6. Customer describes an issue:
   "Brake makes noise."
7. Customer selects appointment.
8. Customer confirms the information.
9. System creates Service Case SRV-2026-001245.
10. Workshop employee sees the appointment.
11. Employee checks in the vehicle.
12. Employee sets priority to HIGH.
13. Employee performs diagnosis:
    "Front brake pads worn."
14. Employee records solution:
    "Replaced front brake pads."
15. Employee records technician notes.
16. Employee marks service ready.
17. System creates simulated customer notification.
18. Customer sees:
    "Your Toyota Camry is ready for pickup."
19. Customer picks up vehicle.
20. Employee marks Delivered.
21. Case becomes COMPLETED.
22. Customer opens Vehicle History.
23. Customer sees the complete service record.

This end-to-end workflow MUST work before the project is considered complete.


==================================================
46. IMPORTANT PROJECT PHILOSOPHY
==================================================

This is a B.E. Computer Science mini-project.

Prioritize:

- Correctness
- Simplicity
- Maintainability
- Clear business workflow
- Good UI
- Proper database design
- REST API design
- Testable business logic
- Easy explanation during viva

Do NOT prioritize unnecessary enterprise complexity.

The final application should be something a student can understand completely and explain confidently during a project presentation and viva.