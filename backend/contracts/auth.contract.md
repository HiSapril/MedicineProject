# Auth Service API Contract

Base URL: /api/auth

## POST /register
Request:
- name: string
- email: string
- password: string
- role: Elderly | Caregiver

Response:
- userId: Guid
- token: string (placeholder)

## POST /login
Request:
- email: string
- password: string

Response:
- userId: Guid
- token: string (placeholder)

## GET /me
Headers:
- Authorization: Bearer {token}

Response:
- userId: Guid
- name: string
- email: string
- role: Elderly | Caregiver

Notes:
- Token is fake (demo scope)
- Authorization logic will be added later
