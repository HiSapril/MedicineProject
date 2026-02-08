# SYSTEM ARCHITECTURE OVERVIEW
Project: Elderly Care Reminder System  
Course: Software Architecture & Design  

---

## 1. PURPOSE OF THIS DOCUMENT

This document provides a high-level architectural overview of the system.

Its goals are:
- To explain the overall system architecture clearly
- To show how Web, Mobile, and Backend components interact
- To guide developers and AI tools to work consistently
- To support academic presentation and project defense

This document focuses on **architecture**, not implementation details.

---

## 2. SYSTEM GOALS

The system aims to:
- Help elderly users remember:
  - Medication schedules
  - Medical appointments
  - Light exercise routines
- Allow caregivers to:
  - Manage schedules
  - Monitor confirmation status
  - View basic health data

The system prioritizes:
- Simplicity
- Reliability
- Clear responsibility separation

---

## 3. ARCHITECTURAL STYLE

The system is designed using:

### 3.1 Microservices Architecture
- Each business domain is implemented as a separate service
- Services are independently deployable
- Each service owns its own data

### 3.2 Event-Driven Architecture (EDA)
- Services communicate asynchronously via events
- RabbitMQ is used as the message broker
- This reduces coupling and improves scalability

---

## 4. HIGH-LEVEL SYSTEM COMPONENTS

### 4.1 Client Applications

#### Web Application (React)
- Primary interface for caregivers
- Used for:
  - Managing medications
  - Managing appointments
  - Viewing health logs
  - Monitoring reminder status
- Acts as a thin client (UI only)

#### Mobile Application (Flutter)
- Primary interface for elderly users
- Used for:
  - Receiving reminders
  - Listening to voice notifications
  - Confirming actions (e.g. "Taken", "Acknowledged")
  - Viewing upcoming appointments
- Optimized for simplicity and accessibility

---

### 4.2 API Gateway
- Single entry point for all client requests
- Routes requests to appropriate backend services
- Handles cross-cutting concerns:
  - Authentication
  - Authorization
  - Rate limiting (optional)

---

### 4.3 Backend Services

| Service | Responsibility |
|------|---------------|
| Auth Service | User authentication and authorization |
| Medication Service | Manage medication schedules |
| Appointment Service | Manage medical appointments |
| Health Tracking Service | Store basic health logs |
| Reminder Service | Generate and track reminders |
| Notification Service | Deliver notifications to users |

Each service:
- Has a clear, single responsibility
- Owns its own database schema

---

## 5. DATA STORAGE & INFRASTRUCTURE

### 5.1 Databases
- SQL Server or PostgreSQL
- Logical database separation per service

### 5.2 Redis
Used as:
- Distributed cache
- Temporary state store
- Tracking reminder acknowledgment status

### 5.3 RabbitMQ
Used as:
- Message broker
- Event bus for asynchronous communication

---

## 6. KEY DOMAIN FLOW (EXAMPLE)

### Reminder Flow (Medication / Appointment)

1. Caregiver creates medication or appointment via Web App
2. Corresponding service stores data and emits a domain event
3. Reminder Service generates reminder schedules
4. When reminder time arrives:
   - Reminder Service emits `ReminderDue` event
5. Notification Service:
   - Sends push notification
   - Triggers voice reminder
6. Elderly user confirms action via Mobile App
7. If no confirmation within a defined time window:
   - `ReminderMissed` event is emitted
   - Caregiver is notified

This flow demonstrates the event-driven nature of the system.

---

## 7. DESIGN PATTERNS APPLIED

### Observer Pattern
- Implemented via RabbitMQ events
- Notification Service observes reminder-related events

### Strategy Pattern
- Used in Reminder Service
- Different strategies generate schedules for:
  - Daily medication
  - Interval-based medication
  - Appointments
  - Exercise routines

---

## 8. ARCHITECTURAL PRINCIPLES

The system adheres to the following principles:
- Low coupling between services
- High cohesion within services
- Thin client architecture
- Clear separation of concerns
- Architecture-first design

---

## 9. SCOPE & LIMITATIONS

For academic scope:
- No complex medical records
- No real IoT integration
- Health data is manually entered
- Focus is on architecture clarity, not production-level scale

---

## 10. CONCLUSION

This architecture is designed to:
- Be understandable and defendable in an academic context
- Demonstrate correct application of software architecture principles
- Support future extension without architectural redesign

The system balances realism with simplicity, ensuring it is suitable for a small student team.

## API Gateway

All clients must communicate through ApiGateway.
Direct access to backend services is prohibited.

The web client defines one page component per feature.
Each page uses a default export and contains no business logic.