# Health Tracking Service API Contract

Base URL: /api/health-logs

## GET /
Response:
- HealthLogResponseDto[]

## POST /
Request:
- date: Date
- bloodPressure: string
- heartRate?: number
- note?: string

Response:
- HealthLogResponseDto

## DELETE /{id}
Response:
- 204 No Content

Notes:
- No health analysis
- Manual input only
