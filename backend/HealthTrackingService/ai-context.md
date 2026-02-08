# Health Tracking Service - AI Context

## Service Overview

The **Health Tracking Service** is a microservice in the Elderly Care Reminder System responsible for storing and retrieving basic health logs.

## Architectural Role

- **Domain**: Health Data Logging
- **Architecture Style**: Microservices + Event-Driven Architecture (EDA)
- **Communication**: REST API for clients, RabbitMQ events for service-to-service

## Responsibilities

This service MUST:
- Store basic health logs (blood pressure, heart rate, notes)
- Provide CRUD operations for health data
- Store health data in its own database
- Emit domain events when health logs are created/updated/deleted (future)
- Provide REST API endpoints for Web and Mobile clients

This service MUST NOT:
- Perform medical analysis or diagnosis
- Send notifications directly (that's Notification Service's responsibility)
- Contain complex health algorithms or logic
- Contain UI logic or frontend code
- Make medical recommendations

## Current Implementation Status

✅ **Completed**:
- Basic ASP.NET Core 8.0 Web API project structure
- RESTful CRUD endpoints (`/api/health-logs`)
- Request/Response DTOs with validation
- Swagger/OpenAPI documentation
- In-memory data storage (for skeleton demonstration)

⏳ **Pending** (Future Implementation):
- Database integration (Entity Framework Core + SQL Server/PostgreSQL)
- RabbitMQ event publishing for domain events:
  - `HealthLogCreated`
  - `HealthLogUpdated`
  - `HealthLogDeleted`
- Authentication/Authorization via API Gateway
- Unit tests and integration tests
- Data visualization endpoints (trends, charts)

## Architecture Compliance

This service follows the rules defined in:
- `architecture/architecture_overview.md`
- `architecture/core_architecture_rules.md`

### Key Architectural Notes:

1. **Simple Health Data Storage**:
   - No complex medical records
   - Basic metrics only: blood pressure, heart rate, notes
   - Manually entered data (no IoT integration per scope limitations)

2. **Microservices Principles**:
   - Single responsibility: Health data storage and retrieval only
   - Owns its own data store
   - Communicates via events and REST API

3. **Event-Driven Architecture**:
   - Will publish events to RabbitMQ when health logs change (future)
   - Other services may subscribe to these events for monitoring/alerts

4. **No Medical Analysis**:
   - This service does NOT analyze health data
   - No decision-making or recommendations
   - Simple CRUD operations only
   - Future analysis could be done by a separate Analytics Service

## Domain Model

### HealthLog Entity

Key properties:
- **Id** & **UserId**: Identifiers
- **Date**: When the measurement was taken
- **BloodPressure**: String format (e.g., "120/80")
- **HeartRate**: Integer (nullable) - beats per minute
- **Note**: Optional text note about health status
- **CreatedAt** & **UpdatedAt**: Audit timestamps

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| GET    | `/api/health-logs` | Get all health logs | 200 OK |
| GET    | `/api/health-logs/{id}` | Get health log by ID | 200 OK, 404 Not Found |
| POST   | `/api/health-logs` | Create new health log | 201 Created, 400 Bad Request |
| PUT    | `/api/health-logs/{id}` | Update health log | 200 OK, 404 Not Found, 400 Bad Request |
| DELETE | `/api/health-logs/{id}` | Delete health log | 204 No Content, 404 Not Found |

## Development Commands

```powershell
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the service
dotnet run

# Access Swagger UI
# Navigate to: https://localhost:7003/swagger
```

## Future Integration Points

### With Caregiver Dashboard (Web App):
- Caregivers view health trends over time
- Charts and visualizations of blood pressure/heart rate
- Alert notifications for abnormal readings (via Notification Service)

### With Mobile App:
- Elderly users or caregivers can log daily measurements
- Simple form input for blood pressure, heart rate, and notes

### With Notification Service (Future):
- Health Tracking Service could emit alerts for abnormal readings
- Notification Service sends alerts to caregivers

### With Auth Service:
- API Gateway will handle authentication
- This service will validate JWT tokens from the gateway

## Data Scope

As per architecture scope limitations:
- **No complex medical records**: Only basic vitals
- **No real IoT integration**: Data is manually entered
- **No medical diagnosis**: Simple storage and retrieval
- **Focus on architecture clarity**: Not production-level medical system

## Notes for AI Agents

When working in this service:
1. Always follow RESTful conventions
2. Keep business logic minimal (CRUD only, no analysis)
3. Use DTOs for all external API contracts
4. Log important operations for debugging
5. Maintain separation of concerns - don't add responsibilities from other services
6. DO NOT add medical analysis or decision-making logic
7. Keep health data simple and manual (as per scope)

Remember: This service is part of a microservices ecosystem. Changes here may affect other services through events. The focus is on demonstrating clean architecture, not building a production medical system.
