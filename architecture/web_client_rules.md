# WEB CLIENT ARCHITECTURE RULES
# Scope: Web Application

## 1. ROLE OF WEB CLIENT
Web application acts as:
- Caregiver Dashboard
- Administrative Interface
- Monitoring & Management Tool

---

## 2. RESPONSIBILITIES
Web Client IS responsible for:
- User authentication (via Auth Service)
- CRUD:
  - Medication
  - Appointment
  - Health Logs
- Viewing reminder status
- Displaying charts and reports

Web Client is IDEAL for:
- Complex forms
- Data tables
- Charts (health trends)

---

## 3. NON-RESPONSIBILITIES
Web Client MUST NOT:
- Generate reminder schedules
- Decide missed reminders
- Handle notification logic
- Contain reminder timing logic

---

## 4. TECHNICAL CONSTRAINTS
- Communicates ONLY via API Gateway
- Uses REST APIs
- Uses token-based authentication (JWT)

---

## 5. UI & UX PRINCIPLES
- Information-dense views are acceptable
- Accessibility is preferred but not deeply enforced
- Focus on clarity for caregivers

---

## 6. ARCHITECTURAL GOAL
Web client must demonstrate:
- Clear separation from backend
- Thin client architecture
- No business logic leakage

The web client is a consumer, not a decision-maker.

## 7. APPOINTMENT MANAGEMENT (WEB)

Web Client MUST provide:
- Appointment List Page
- Create / Edit / Delete Appointment
- Appointment Detail View:
  - Date & time
  - Hospital
  - Doctor name
  - Notes
  - Reminder status

Web is the PRIMARY interface for:
- Caregivers to manage appointments
- Viewing upcoming medical visits
- Adjusting appointment reminder time

Appointment pages are REQUIRED for architectural completeness.

Each domain has its own *.api.ts file.
Pages must not call axios directly.

All TypeScript interfaces and types must be imported using `import type`.