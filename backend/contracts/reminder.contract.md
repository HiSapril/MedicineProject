# Reminder Service API Contract

Base URL: /api/reminders

## GET /
Response:
- ReminderResponseDto[]

## POST /
Request:
- userId: Guid
- type: Medication | Appointment | Exercise
- referenceId: Guid
- scheduledTime: DateTime

Response:
- ReminderResponseDto

## PUT /{id}/status
Request:
- status: Pending | Done | Missed

Response:
- ReminderResponseDto

## DELETE /{id}
Response:
- 204 No Content

Notes:
- No scheduling logic yet
- No notification logic
