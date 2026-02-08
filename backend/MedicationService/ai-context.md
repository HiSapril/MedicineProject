# Medication Service - AI Context

## Service Overview

The **Medication Service** is a microservice in the Elderly Care Reminder System responsible for managing medication schedules.

## Architectural Role

- **Domain**: Medication Schedules
- **Architecture Style**: Microservices + Event-Driven Architecture (EDA)
- **Communication**: REST API for clients, RabbitMQ events for service-to-service

## Responsibilities

This service MUST:
- Manage medication schedule CRUD operations (Create, Read, Update, Delete)
- Store medication data in its own database
- Emit domain events when medications are created/updated/deleted
- Provide REST API endpoints for Web and Mobile clients

This service MUST NOT:
- Send notifications directly (that's Notification Service's responsibility)
- Generate reminders directly (that's Reminder Service's responsibility)
- Handle scheduling logic (Reminder Service handles that)
- Contain UI logic or frontend code

## Current Implementation Status

✅ **Completed**:
- Basic ASP.NET Core 8.0 Web API project structure
- RESTful CRUD endpoints (`/api/medications`)
- Request/Response DTOs with validation
- Swagger/OpenAPI documentation
- In-memory data storage (for skeleton demonstration)

⏳ **Pending** (Future Implementation):
- Database integration (Entity Framework Core + SQL Server/PostgreSQL)
- RabbitMQ event publishing for domain events:
  - `MedicationCreated`
  - `MedicationUpdated`
  - `MedicationDeleted`
- Integration with Reminder Service
- Authentication/Authorization via API Gateway
- Unit tests and integration tests

## Architecture Compliance

This service follows the rules defined in:
- `architecture/architecture_overview.md`
- `architecture/core_architecture_rules.md`

### Key Architectural Notes:

1. **Medication as First-Class Domain Object**:
   - Medications are primary domain entities
   - Connected to Reminder Service for notifications
   - Displayed on both Web and Mobile clients

2. **Microservices Principles**:
   - Single responsibility: Medication management only
   - Owns its own data store
   - Communicates via events and REST API

3. **Event-Driven Architecture**:
   - Will publish events to RabbitMQ when medications change
   - Other services (Reminder, Notification) will subscribe to these events

4. **No Scheduling Logic**:
   - This service does NOT contain reminder scheduling logic
   - Reminder Service will consume medication events and generate schedules
   - Medication service only stores schedule metadata (times, frequency)

## Domain Model

### Medication Entity

Key properties:
- **Id** & **UserId**: Identifiers
- **MedicationName**: Name of the medication
- **Dosage**: Amount to take (e.g., "500mg", "2 tablets")
- **Frequency**: How often (e.g., "Daily", "Twice a day", "Every 8 hours")
- **ScheduledTimes**: Simple string format for times (e.g., "08:00, 20:00")
- **Instructions**: Optional additional instructions
- **StartDate** & **EndDate**: Duration of medication schedule
- **CreatedAt** & **UpdatedAt**: Audit timestamps

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| GET    | `/api/medications` | Get all medications | 200 OK |
| GET    | `/api/medications/{id}` | Get medication by ID | 200 OK, 404 Not Found |
| POST   | `/api/medications` | Create new medication | 201 Created, 400 Bad Request |
| PUT    | `/api/medications/{id}` | Update medication | 200 OK, 404 Not Found, 400 Bad Request |
| DELETE | `/api/medications/{id}` | Delete medication | 204 No Content, 404 Not Found |

## Development Commands

```powershell
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the service
dotnet run

# Access Swagger UI
# Navigate to: https://localhost:7002/swagger
```

## Future Integration Points

### With Reminder Service:
- When medication is created → emit `MedicationCreated` event
- Reminder Service creates reminder schedules based on medication frequency and times
- Supports different reminder strategies:
  - Daily medication
  - Interval-based medication
  - Multi-time medication (e.g., morning and evening)

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
6. DO NOT add scheduling logic here - that belongs in Reminder Service

Remember: This service is part of a microservices ecosystem. Changes here may affect other services through events.
