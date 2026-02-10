# Universal Form Input Pattern & UI/UX Rules

This document defines the standard architecture and interaction pattern for all forms within the Elderly Care Management System. It ensures consistency, safety, and accessibility across the `HealthPage`, `MedicationsPage`, `AppointmentsPage`, and `RemindersPage`.

## 1. Form Architecture

Forms must follow a strictly vertical, hierarchical structure to minimize visual scanning effort for elderly users and caregivers.

### A. Form Container
- **Layout**: Centered card-based layout (`max-width: 600px` for simple forms, `800px` for multi-section forms).
- **Header**: Contains a prominent `<h2>` title and a subtle `<p>` description explaining the form's specific purpose.
- **Primary Action**: Only one primary high-contrast button per form (e.g., "Save Medication").

### B. Field Grouping
- **Semantic Sections**: Fields must be grouped into logical `<section>` blocks (e.g., "Basic Information", "Details", "Schedule").
- **Visual Separation**: Each group must be separated by a soft horizontal divider or increased white space (`32px`).
- **Section Headers**: Each section must have a clear `<h3>` header, optionally accompanied by a relevant icon.

### C. Input Elements
- **Labeling**: Labels MUST be placed directly above the input field. Avoid side-by-side layouts which are harder to scan.
- **Helpers**: Descriptive helper text should appear below the input in a subtle color (`#7f8c8d`).
- **Required Fields**: Indicate required fields with a clear "(Required)" suffix in the label, rather than just an asterisk.
- **States**:
    - **Active/Focus**: A high-contrast blue ring (`2px solid #3498db`) with a `4px` offset.
    - **Read-only**: Light grey background with a "lock" icon if applicable. Text remains high-contrast (`#2c3e50`).
    - **Disabled**: Lower opacity (`0.5`) with a "not-allowed" cursor.

---

## 2. Interaction & Behavior Rules

### Validation Pattern
- **Feedback Loop**: Perform validation `onBlur` (when the user leaves the field) to avoid distracting them during typing.
- **Language**: Use human-centric messages.
    - *Incorrect*: "Field 'med_qty' cannot be null."
    - *Correct*: "Please enter how many pills to take."
- **Visuals**: Use a soft red border and error text below the field. Avoid alarming full-screen alerts.

### Submission Flow
- **Progressive Disclosure**: Disable the submit button and show a "Saving..." state with a spinner during API calls.
- **Feedback**: 
    - **Success**: Use a green "Success" toast or a clear inline message at the top of the form.
    - **Error**: Differentiate between "Connection issues" and "Invalid data" clearly.

### Modes: Create vs. Edit
- **Visual Distinction**: 
    - **Create**: "Add New [Item]" title, empty fields.
    - **Edit**: "Edit [Item Name]" title. 
    - **Persistent Data**: Display immutable keys (like ID or creation date) in a read-only "Identity" group at the top or bottom.

### Safe Exit Strategy
- **Dirty State**: Track if any field has been modified.
- **Confirmation**: If the user attempts to click "Back" or "Cancel" while the form is "dirty," trigger a confirmation modal: *"You have unsaved changes. Are you sure you want to leave?"*
- **Accidental Loss Avoidance**: The "Cancel" button should be visually secondary (outline or text-only) to prevent accidental clicks.

---

## 3. Accessibility & Safety (Critical)

- **Touch/Click Targets**: All interactive elements (inputs, toggles, buttons) must have a minimum height of `48px`.
- **Contrast**: Maintain a ratio of at least `4.5:1` for all text against its background.
- **Keyboard Flow**: Logical `tabindex` following the visual structure (Top → Down, Left → Right).
- **No Mystery Meat UI**: Every icon used in a form must have an associated text label or tooltip.
- **Error Focus**: Upon a failed submission, move the browser focus to the first invalid field.

---

## 4. Visual Language Summary

| Element | Specification |
| :--- | :--- |
| **Primary Color** | `#3498db` (Calm Blue) |
| **Success Color** | `#27ae60` (Soft Green) |
| **Warning Color** | `#f39c12` (Amber) |
| **Error Color** | `#e74c3c` (Soft Red) |
| **Corners** | `12px` border-radius for containers; `8px` for inputs/buttons |
| **Shadows** | `0 4px 12px rgba(0,0,0,0.05)` (Subtle depth) |
| **Typography** | Labels: `14px Bold`; Inputs: `16px Regular`; Titles: `24px-32px Bold` |

---

## 5. Architectural Justification

The "Safe-Single-Vertical" pattern minimizes cognitive load by providing a predictable linear path. By separating validation from the typing experience and enforcing clear feedback loops, we reduce user anxiety—a critical factor in healthcare applications for seniors and busy caregivers.
