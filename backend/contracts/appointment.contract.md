# Appointment Service API Contract

Base URL: /api/appointments

## GET /
Response:
- AppointmentResponseDto[]

## GET /{id}
Response:
- AppointmentResponseDto

## POST /
Request:
- doctorName: string
- location: string
- appointmentDate: DateTime
- note?: string

Response:
- AppointmentResponseDto

## PUT /{id}
Request:
- same as POST (all optional)

Response:
- AppointmentResponseDto

## DELETE /{id}
Response:
- 204 No Content

Notes:
- Appointment is a first-class domain entity
- Reminder logic is NOT handled here
