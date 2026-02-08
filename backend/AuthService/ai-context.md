# Auth Service - AI Context

## Service Overview

The **Auth Service** is a microservice in the Elderly Care Reminder System responsible for user authentication and basic identity management.

## ⚠️ IMPORTANT: Demo/Academic Version

**THIS IS A SIMPLIFIED DEMO IMPLEMENTATION FOR ACADEMIC PURPOSES ONLY**

Current limitations (NOT for production):
- ❌ **No real JWT tokens** - Uses placeholder tokens (`demo-token-{userId}`)
- ❌ **No password hashing** - Passwords stored as plain text
- ❌ **No token expiration** - Tokens don't expire
- ❌ **No refresh tokens** - No token refresh mechanism
- ❌ **In-memory storage** - Users lost on restart
- ❌ **No authorization logic** - Only authentication

## Architectural Role

- **Domain**: User Authentication & Identity Management
- **Architecture Style**: Microservices + Event-Driven Architecture (EDA)
- **Communication**: REST API for clients, future integration with API Gateway

## Responsibilities

This service MUST:
- Handle user registration
- Authenticate users (login)
- Provide user information
- Issue authentication tokens (currently placeholders, will be JWT)
- Store user data in its own database (future)

This service MUST NOT:
- Handle authorization for other services (that's API Gateway's role)
- Manage permissions beyond basic roles
- Contain business logic from other domains
- Contain UI logic or frontend code

## Current Implementation Status

✅ **Completed** (Demo Version):
- Basic ASP.NET Core 8.0 Web API project structure
- Authentication endpoints (`/api/auth`)
- User registration with email and role
- User login with email/password
- Get current user endpoint
- Request/Response DTOs with validation
- Swagger/OpenAPI documentation
- In-memory user storage

⏳ **Pending** (Production Features):
- **JWT Token Generation**:
  - Use `System.IdentityModel.Tokens.Jwt`
  - Generate proper JWT with claims (userId, email, role)
  - Set token expiration (e.g., 24 hours)
  - Add refresh token mechanism
  
- **Password Security**:
  - Use BCrypt or PBKDF2 for password hashing
  - Add password validation rules
  - Implement password reset functionality

- **Database Integration**:
  - Entity Framework Core + SQL Server/PostgreSQL
  - Proper user table with indexes
  - Migration for user schema

- **API Gateway Integration**:
  - Provide JWT validation for other services
  - Share JWT secret/public key with gateway

- **Additional Features**:
  - Email verification
  - Two-factor authentication (optional)
  - Account lockout after failed attempts
  - Audit logging for security events
  - Unit tests and integration tests

## Architecture Compliance

This service follows the rules defined in:
- `architecture/architecture_overview.md`
- `architecture/core_architecture_rules.md`

### Key Architectural Notes:

1. **Microservices Principles**:
   - Single responsibility: Authentication and user identity only
   - Owns its own data store (user accounts)
   - Communicates via REST API

2. **API Gateway Integration** (Future):
   - Auth Service issues JWT tokens
   - API Gateway validates these tokens for all requests
   - Other services trust the gateway's authentication

3. **Cross-Cutting Concern**:
   - Authentication is a cross-cutting concern
   - Centralized in this service (per architecture rules)
   - All clients use this service for login/registration

## Domain Model

### User Entity

Key properties:
- **Id** (Guid): Unique identifier
- **Name** (string): Full name
- **Email** (string): Email address (used as username)
- **Password** (string): Currently plain text (DEMO ONLY)
- **Role** (enum): `Elderly` or `Caregiver`
- **CreatedAt** (DateTime): Account creation timestamp

### UserRole Enum
- `Elderly`: Elderly person receiving care
- `Caregiver`: Person managing elderly care

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| POST   | `/api/auth/register` | Register new user | 200 OK, 400 Bad Request |
| POST   | `/api/auth/login` | Login user | 200 OK, 401 Unauthorized |
| GET    | `/api/auth/me` | Get current user info | 200 OK, 401 Unauthorized |

### Endpoint Details

**POST /api/auth/register**
- Creates new user account
- Checks for duplicate email
- Returns user info with token
- Currently: plain text password (DEMO)
- Future: hash password before storing

**POST /api/auth/login**
- Validates email and password
- Returns user info with token
- Currently: simple string comparison (DEMO)
- Future: compare hashed password

**GET /api/auth/me**
- Requires `Authorization` header with token
- Header format: `Authorization: Bearer demo-token-{userId}`
- Returns current user information
- Currently: parses placeholder token (DEMO)
- Future: validate JWT and extract claims

## Development Commands

```powershell
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the service
dotnet run

# Access Swagger UI
# Navigate to: https://localhost:7004/swagger
```

## Token Format (Current Demo)

**Placeholder Token Format**: `demo-token-{userId}`

Example: `demo-token-3fa85f64-5717-4562-b3fc-2c963f66afa6`

**Future JWT Token Format**:
```
header.payload.signature
```

With claims:
```json
{
  "sub": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "role": "Caregiver",
  "exp": 1738742400
}
```

## Future Integration Points

### With API Gateway:
- API Gateway validates JWT tokens from Auth Service
- All other services receive authenticated user info from gateway
- Single source of truth for authentication

### With Web/Mobile Apps:
- Users register/login via this service
- Receive token to use for subsequent requests
- Include token in `Authorization` header for all API calls

### With Other Services:
- Other services DON'T directly communicate with Auth Service
- They receive authenticated user context from API Gateway
- Auth Service is isolated, single responsibility

## Migration Path to Production

1. **Implement JWT**:
   - Install `Microsoft.AspNetCore.Authentication.JwtBearer`
   - Configure JWT generation with secret key
   - Add token expiration and claims

2. **Add Password Hashing**:
   - Install `BCrypt.Net-Next`
   - Hash passwords on registration
   - Verify hashed passwords on login

3. **Database Integration**:
   - Add Entity Framework Core
   - Create User entity mapping
   - Add migrations

4. **Security Hardening**:
   - HTTPS only
   - Rate limiting for login attempts
   - Account lockout mechanism
   - Audit logging

## Notes for AI Agents

When working in this service:
1. **Remember this is DEMO code** - not production-ready
2. Use DTOs for all external API contracts
3. Log important authentication events
4. Maintain separation of concerns
5. **DO NOT** add business logic from other domains
6. **DO NOT** implement authorization policies here (that's for API Gateway)
7. When upgrading to production:
   - Replace all placeholder token logic with JWT
   - Replace all plain text passwords with hashed passwords
   - Add proper error handling and validation

Remember: This service demonstrates the authentication architecture but is intentionally simplified for academic presentation. Production implementation requires proper security measures.
