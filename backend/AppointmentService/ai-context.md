# Appointment Service - AI Context

## Service Overview

The **Appointment Service** is a microservice in the Elderly Care Reminder System responsible for managing medical appointments.

## Architectural Role

- **Domain**: Medical Appointments
- **Architecture Style**: Microservices + Event-Driven Architecture (EDA)
- **Communication**: REST API for clients, RabbitMQ events for service-to-service

## Responsibilities

This service MUST:
- Manage appointment CRUD operations (Create, Read, Update, Delete)
- Store appointment data in its own database
- Emit domain events when appointments are created/updated/deleted
- Provide REST API endpoints for Web and Mobile clients

This service MUST NOT:
- Send notifications directly (that's Notification Service's responsibility)
- Generate reminders directly (that's Reminder Service's responsibility)
- Contain UI logic or frontend code

## Current Implementation Status

✅ **Completed**:
- Basic ASP.NET Core 8.0 Web API project structure
- RESTful CRUD endpoints (`/api/appointments`)
- Request/Response DTOs with validation
- Swagger/OpenAPI documentation
- In-memory data storage (for skeleton demonstration)

⏳ **Pending** (Future Implementation):
- Database integration (Entity Framework Core + SQL Server/PostgreSQL)
- RabbitMQ event publishing for domain events:
  - `AppointmentCreated`
  - `AppointmentUpdated`
  - `AppointmentDeleted`
- Integration with Reminder Service
- Authentication/Authorization via API Gateway
- Unit tests and integration tests

## Architecture Compliance

This service follows the rules defined in:
- `architecture/architecture_overview.md`
- `architecture/core_architecture_rules.md`

### Key Architectural Notes:

1. **Appointment as First-Class Domain Object** (Rule #8):
   - Appointments are treated as primary domain entities
   - Connected to Reminder Service for notifications
   - Displayed on both Web and Mobile clients

2. **Microservices Principles**:
   - Single responsibility: Appointment management only
   - Owns its own data store
   - Communicates via events and REST API

3. **Event-Driven Architecture**:
   - Will publish events to RabbitMQ when appointments change
   - Other services (Reminder, Notification) will subscribe to these events

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/appointments` | Get all appointments |
| GET    | `/api/appointments/{id}` | Get appointment by ID |
| POST   | `/api/appointments` | Create new appointment |
| PUT    | `/api/appointments/{id}` | Update appointment |
| DELETE | `/api/appointments/{id}` | Delete appointment |

## Development Commands

```powershell
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the service
dotnet run

# Access Swagger UI
# Navigate to: https://localhost:7001/swagger
```

## Future Integration Points

### With Reminder Service:
- When appointment is created → emit `AppointmentCreated` event
- Reminder Service creates reminder schedules based on appointment date
- Supports configurable reminder offsets (e.g., 1 day before, 2 hours before)

### With Notification Service:
- Reminder Service emits `ReminderDue` event
- Notification Service sends notifications to users

### With Auth Service:
- API Gateway will handle authentication
- This service will validate JWT tokens from the gateway

## Notes for AI Agents

When working in this service:
1. Always follow RESTful conventions
2. Keep business logic minimal (this is a simple CRUD service)
3. Use DTOs for all external API contracts
4. Log important operations for debugging
5. Maintain separation of concerns - don't add responsibilities from other services

Remember: This service is part of a microservices ecosystem. Changes here may affect other services through events.
