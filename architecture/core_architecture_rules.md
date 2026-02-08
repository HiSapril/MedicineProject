# CORE SYSTEM ARCHITECTURE RULES
# Project: Elderly Care Reminder System

## 1. PURPOSE
This rule set defines the immutable architectural foundation of the system.
All components (Web, Mobile, Backend) MUST comply with these rules.

---

## 2. ARCHITECTURE STYLE (IMMUTABLE)
- Microservices Architecture
- Event-Driven Architecture (EDA)

---

## 3. SYSTEM COMPONENTS
Clients:
- Web Application
- Mobile Application

Backend:
- API Gateway
- Auth Service
- Medication Service
- Appointment Service
- Health Tracking Service
- Reminder Service
- Notification Service

Infrastructure:
- RabbitMQ (event bus)
- Redis (cache, temporary state)
- SQL Server / PostgreSQL
- Docker & Docker Compose

---

## 4. COMMUNICATION RULES
- Client → Backend: REST API only
- Service → Service:
  - Sync: REST (limited)
  - Async: RabbitMQ Events (preferred)

Clients MUST NOT:
- Communicate directly with databases
- Communicate directly with RabbitMQ
- Contain business logic

---

## 5. DESIGN PATTERNS (MANDATORY)
- Observer Pattern:
  - Implemented via RabbitMQ
  - Used for Reminder & Notification flow
- Strategy Pattern:
  - Used for reminder schedule generation

---

## 6. DATA SCOPE
Only simple, demo-appropriate data is allowed.
No complex medical records.
No real IoT integrations.

---

## 7. ARCHITECTURAL PRIORITIES
- Low coupling
- High cohesion
- Clear responsibility boundaries

If conflict occurs, architectural clarity takes priority.

## 8. APPOINTMENT AS FIRST-CLASS DOMAIN OBJECT

Appointment is a first-class domain entity.

Rules:
- Appointment MUST be:
  - Managed via Appointment Service
  - Displayed on both Web and Mobile clients
  - Connected to Reminder Service for notification

- Reminder Service MUST support:
  Reminder.Type = Appointment

- Appointment reminders follow:
  - One-time schedule
  - Configurable reminder offset (e.g. 1 day before, 2 hours before)

Appointment is NOT passive data.
It actively participates in reminder and notification flows.
