# IMPLEMENTATION PLAN: Phase 3 - Advanced Features

## Goal
Implement advanced features for a comprehensive system:
1.  **Export Reports**: Allow users to download health reports as PDF.
2.  **Internationalization (i18n)**: Support English and Vietnamese languages.

## User Review Required
> [!IMPORTANT]
> I will be installing `jspdf`, `jspdf-autotable`, `i18next`, and `react-i18next`.

## Proposed Changes

### 1. Export Reports
#### [NEW] Dependency
-   `npm install jspdf jspdf-autotable`

#### [NEW] [ReportPage.tsx](file:///d:/hoc%20tap/MedicineProject/web-app/elderly-care-web/src/pages/ReportPage.tsx)
-   Create a new page accessible from Sidebar.
-   Button: "Download Health Report".
-   Logic: Fetch health logs and Appointments -> Generate PDF Table -> Trigger download.

#### [MODIFY] [AppLayout.tsx](file:///d:/hoc%20tap/MedicineProject/web-app/elderly-care-web/src/components/layout/AppLayout.tsx)
-   Add "Reports" link to the sidebar.

### 2. Internationalization (i18n)
#### [NEW] Dependency
-   `npm install i18next react-i18next`

#### [NEW] [i18n.ts](file:///d:/hoc%20tap/MedicineProject/web-app/elderly-care-web/src/i18n.ts)
-   Configure i18next resources (EN/VN).
-   Initialize in `main.tsx`.

#### [MODIFY] [AppLayout.tsx](file:///d:/hoc%20tap/MedicineProject/web-app/elderly-care-web/src/components/layout/AppLayout.tsx)
-   Add a Language Toggle flag/button in the Header.

#### [MODIFY] Multiple Pages
-   Replace hardcoded text with `t('key')`. focus on Sidebar and Dashboard first.

## Verification Plan

### Manual Verification
1.  **PDF**: Click "Download" -> Open file -> Check table data matches UI.
2.  **Language**: Switch Toggle -> Text changes between English and Vietnamese.
