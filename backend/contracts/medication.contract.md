# Medication Service API Contract

Base URL: /api/medications

## GET /
Response:
- MedicationResponseDto[]

## POST /
Request:
- name: string
- dosage: string
- scheduleTimes: string[]
- startDate: Date
- endDate?: Date

Response:
- MedicationResponseDto

## PUT /{id}
Request:
- same as POST (all optional)

## DELETE /{id}
Response:
- 204 No Content

Notes:
- Scheduling is delegated to Reminder Service
