# API Gateway Context

This service acts as a reverse proxy using YARP.

Responsibilities:
- Route client requests to backend services
- Centralize API entry point

Non-responsibilities:
- No authentication logic
- No business logic
- No data processing

All frontend clients MUST call APIs through this gateway.
