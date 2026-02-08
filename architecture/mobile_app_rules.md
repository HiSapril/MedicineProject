# MOBILE APP ARCHITECTURE RULES
# Scope: Mobile Application

## 1. ROLE OF MOBILE APP
Mobile application acts as:
- Primary interaction point for elderly users
- Reminder acknowledgment interface
- Simple health input tool

---

## 2. RESPONSIBILITIES
Mobile App IS responsible for:
- Receiving reminder notifications
- Displaying reminder in a simple manner
- Playing voice reminders (TTS)
- Allowing "Done / Not Done" confirmation
- Simple health data input

---

## 3. NON-RESPONSIBILITIES
Mobile App MUST NOT:
- Calculate reminder schedules
- Decide missed reminders
- Store long-term data
- Communicate with other services directly

---

## 4. TECHNICAL CONSTRAINTS
- Communicates ONLY via API Gateway
- Push notifications via Notification Service
- TTS is client-side only
- Offline mode is optional and minimal

---

## 5. UX PRINCIPLES (ELDERLY-FIRST)
- Large buttons
- Minimal text
- One action per screen
- No complex navigation

---

## 6. ARCHITECTURAL GOAL
Mobile app must demonstrate:
- Event consumption, not orchestration
- Ultra-thin client design
- Accessibility-driven UI

The mobile app reacts to the system; it does not control it.

## 7. APPOINTMENT VIEWING & REMINDER (MOBILE)

Mobile App MUST provide:
- Appointment List (read-only or minimal edit)
- Appointment Reminder Notification
- Clear display of:
  - Appointment time
  - Hospital name
  - Doctor name

Mobile App MAY:
- Allow confirmation: "I am on the way" or "Acknowledged"

Mobile App MUST NOT:
- Modify complex appointment details
- Handle appointment reminder logic

Appointment reminder UX must be:
- Simple
- Clear
- Action-focused
