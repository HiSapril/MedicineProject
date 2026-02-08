# Web Frontend AI Context

Project:
- Elderly Care Web App
- React + TypeScript (Vite)

Architecture rules:
- This web app is a CLIENT only
- MUST call backend via ApiGateway
- API Base URL: http://localhost:5041
- MUST follow backend/contracts
- No business logic in UI components

Folder rules:
- API calls only in /src/api
- Pages only call API layer
- Components are UI-only

AI agent must NOT:
- Call backend services directly
- Create or modify API endpoints
- Embed fetch/axios in components

Appointments page has been successfully connected to ApiGateway.
