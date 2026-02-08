# Reminder Service - AI Context

## Service Overview

The **Reminder Service** is a microservice in the Elderly Care Reminder System responsible for managing reminder data.

## ⚠️ IMPORTANT: Current Limitations

**THIS IS A MINIMAL SKELETON - CORE FEATURES NOT YET IMPLEMENTED**

What's NOT included (to be added later):
- ❌ **NO scheduling logic** - Reminders are stored but not automatically triggered
- ❌ **NO background service** - No worker checking for due reminders
- ❌ **NO RabbitMQ integration** - Not consuming events from other services
- ❌ **NO notification sending** - This service does NOT send notifications
- ❌ **In-memory storage** - Reminders lost on restart

## Architectural Role

- **Domain**: Reminder Management
- **Architecture Style**: Microservices + Event-Driven Architecture (EDA)
- **Communication**: REST API for clients, future RabbitMQ for events

## Responsibilities

This service MUST:
- Store reminder data (type, scheduled time, status)
- Provide CRUD operations for reminders
- Track reminder status (Pending, Done, Missed)
- Link reminders to Medication/Appointment entities via ReferenceId

This service MUST NOT:
- Send notifications directly (that's Notification Service's responsibility)
- Contain medication or appointment business logic
- Contain UI logic or frontend code

## Current Implementation Status

✅ **Completed** (Skeleton Version):
- Basic ASP.NET Core 8.0 Web API project structure
- RESTful CRUD endpoints (`/api/reminders`)
- Reminder entity with Type and Status enums
- Request/Response DTOs with validation
- Status update endpoint (`PUT /api/reminders/{id}/status`)
- Swagger/OpenAPI documentation
- In-memory data storage

⏳ **Pending** (Core Features):

### 1. Event-Driven Integration (High Priority)
- **Consume Events from Medication Service**:
  - `MedicationCreated` → Auto-create reminders based on medication schedule
  - `MedicationUpdated` → Update or recreate related reminders
  - `MedicationDeleted` → Delete related reminders

- **Consume Events from Appointment Service**:
  - `AppointmentCreated` → Create reminder(s) before appointment
  - `AppointmentUpdated` → Update reminder time
  - `AppointmentDeleted` → Delete related reminders

- **Emit Events to Notification Service**:
  - `ReminderDue` → When scheduled time arrives
  - `ReminderStatusChanged` → When user marks as Done/Missed

### 2. Scheduling Logic (Critical)
- Background service checking for due reminders
- Timer-based or queue-based scheduling
- Mark reminders as Missed if scheduled time passes without acknowledgment
- Emit `ReminderDue` events at scheduled time

### 3. Database Integration
- Entity Framework Core + SQL Server/PostgreSQL
- Persistent reminder storage
- Indexes on UserId, ScheduledTime, Status

### 4. Additional Features
- Bulk create reminders for recurring schedules
- Snooze functionality
- Recurring reminder patterns
- Query by user, date range, status

## Architecture Compliance

This service follows the rules defined in:
- `architecture/architecture_overview.md`
- `architecture/core_architecture_rules.md`

### Key Architectural Notes:

1. **Event-Driven Architecture**:
   - This service is a **key orchestrator** in the EDA pattern
   - Consumes events from Medication/Appointment services
   - Emits events for Notification Service
   - Per architecture: "Reminder Service reacts to domain events"

2. **Microservices Principles**:
   - Single responsibility: Reminder scheduling and status tracking
   - Owns its own data store
   - Communicates via events and REST API

3. **Cross-Service Coordination**:
   - Links to other entities via ReferenceId (loose coupling)
   - Does NOT directly call other services
   - Uses events for decoupled communication

## Domain Model

### Reminder Entity

Key properties:
- **Id** & **UserId**: Identifiers
- **Type** (enum): Medication, Appointment, Exercise
- **ReferenceId**: Links to source entity (Medication ID or Appointment ID)
- **ScheduledTime**: When to trigger the reminder
- **Status** (enum): Pending, Done, Missed
- **CreatedAt** & **UpdatedAt**: Audit timestamps

### ReminderType Enum
- `Medication` - Medication reminder
- `Appointment` - Appointment reminder
- `Exercise` - Exercise reminder (manual creation)

### ReminderStatus Enum
- `Pending` - Scheduled, not yet triggered
- `Done` - User acknowledged/completed
- `Missed` - Scheduled time passed without acknowledgment

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| GET    | `/api/reminders` | Get all reminders | 200 OK |
| GET    | `/api/reminders/{id}` | Get reminder by ID | 200 OK, 404 Not Found |
| POST   | `/api/reminders` | Create new reminder | 201 Created, 400 Bad Request |
| PUT    | `/api/reminders/{id}/status` | Update reminder status | 200 OK, 404 Not Found, 400 Bad Request |
| DELETE | `/api/reminders/{id}` | Delete reminder | 204 No Content, 404 Not Found |

### Endpoint Notes

**POST /api/reminders** - Manual Creation:
- Currently: Manually create individual reminders
- Future: Auto-created via events from Medication/Appointment services

**PUT /api/reminders/{id}/status** - Status Update:
- Used by mobile/web apps when user acknowledges reminder
- Changes status to Done or Missed
- Future: Emit `ReminderStatusChanged` event

## Development Commands

```powershell
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the service
dotnet run

# Access Swagger UI
# Navigate to: https://localhost:7005/swagger
```

## Future Integration Points

### With Medication Service (via RabbitMQ):
**Consumes**:
- `MedicationCreated` → Create reminders based on schedule
- `MedicationUpdated` → Update reminders
- `MedicationDeleted` → Delete reminders

**Example**:
```
Medication created: "Aspirin, twice daily"
→ Reminder Service creates 2 reminders per day automatically
```

### With Appointment Service (via RabbitMQ):
**Consumes**:
- `AppointmentCreated` → Create reminder(s) before appointment
- `AppointmentUpdated` → Update reminder time
- `AppointmentDeleted` → Delete reminder

**Example**:
```
Appointment created: "Doctor visit at 2 PM"
→ Reminder Service creates reminder for 1:30 PM (30 min before)
```

### With Notification Service (via RabbitMQ):
**Emits**:
- `ReminderDue` → When scheduled time arrives
- Notification Service receives event and sends push/SMS/email

**Example**:
```
Reminder scheduled time arrives
→ Background service emits ReminderDue event
→ Notification Service sends push notification to mobile app
```

### With Web/Mobile Apps (via REST API):
- Apps query reminders for display
- Apps update status when user acknowledges reminder
- Apps can manually create Exercise reminders

## Scheduling Implementation (Future)

### Option 1: Background Service with Timer
```csharp
public class ReminderSchedulerService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckDueReminders();
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
    
    private async Task CheckDueReminders()
    {
        // Check for reminders where ScheduledTime <= now AND Status == Pending
        // Emit ReminderDue event for each
        // Update status or leave as Pending based on business rules
    }
}
```

### Option 2: Hangfire or Quartz.NET
- More robust scheduling
- Job persistence
- Better for distributed systems

## Event Examples (Future)

### Consuming Event
```json
{
  "eventType": "MedicationCreated",
  "medicationId": "guid",
  "userId": "guid",
  "schedule": {
    "times": ["08:00", "20:00"],
    "frequency": "daily"
  }
}
```

### Emitting Event
```json
{
  "eventType": "ReminderDue",
  "reminderId": "guid",
  "userId": "guid",
  "type": "Medication",
  "referenceId": "medication-guid",
  "scheduledTime": "2026-02-05T08:00:00Z"
}
```

## Notes for AI Agents

When working in this service:
1. **Remember**: This is currently a skeleton without core functionality
2. **Next priority**: Event-driven integration with RabbitMQ
3. **Second priority**: Background scheduling service
4. Keep CRUD operations minimal and clean
5. Use DTOs for all external API contracts
6. Log important operations
7. **DO NOT** add notification sending logic here
8. **DO NOT** add business logic from other domains
9. When implementing scheduling:
   - Use background service or job scheduler
   - Emit events, don't call Notification Service directly
   - Handle timezone conversions properly

Remember: This service is the **bridge** between source entities (Medication/Appointment) and notifications. It orchestrates when reminders should fire, but doesn't send notifications itself.

## Critical TODOs

Priority order:
1. ✅ Add RabbitMQ consumer for Medication/Appointment events
2. ✅ Add background scheduling service
3. ✅ Add RabbitMQ publisher for ReminderDue events
4. ✅ Database integration
5. ✅ Timezone handling
6. Unit and integration tests

Without these features, the service is **NOT functional** for the intended architecture. It's currently just a data storage API.
