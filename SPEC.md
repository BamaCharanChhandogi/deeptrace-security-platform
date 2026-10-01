# SHARED TECHNICAL SPECIFICATION
# All builders must follow this spec for consistency.

## PROJECT ROOT: d:\Programming\TEMP\deeptrace-security-platform

## MODULE SYSTEM
- Backend: CommonJS (require / module.exports)
- Frontend: ES Modules (import / export)

## RESPONSE FORMAT (all API responses)

Success:
```json
{ "success": true, "data": { ... }, "message": "..." }
```

List with pagination:
```json
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

Error:
```json
{ "success": false, "error": { "message": "...", "code": "ERROR_CODE", "details": [] } }
```

## DATABASE SCHEMA (PostgreSQL)

### tenants
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | FK→tenants(id) ON DELETE CASCADE, NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| role | ENUM('ADMIN','MANAGER','USER') | NOT NULL, DEFAULT 'USER' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE(tenant_id, email) | | |

### campaigns
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | FK→tenants(id) ON DELETE CASCADE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| status | ENUM('DRAFT','ACTIVE','COMPLETED','CANCELLED') | NOT NULL, DEFAULT 'DRAFT' |
| start_date | DATE | |
| end_date | DATE | |
| created_by | UUID | FK→users(id) ON DELETE SET NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
| INDEX(tenant_id, status) | | |
| INDEX(tenant_id, created_at) | | |

### campaign_members
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| campaign_id | UUID | FK→campaigns(id) ON DELETE CASCADE, NOT NULL |
| user_id | UUID | FK→users(id) ON DELETE CASCADE, NOT NULL |
| assigned_by | UUID | FK→users(id) ON DELETE SET NULL |
| assigned_at | TIMESTAMP | DEFAULT NOW() |
| UNIQUE(campaign_id, user_id) | | |

### security_events
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | FK→tenants(id) ON DELETE CASCADE, NOT NULL |
| event_type | VARCHAR(50) | NOT NULL |
| severity | ENUM('LOW','MEDIUM','HIGH','CRITICAL') | NOT NULL |
| status | ENUM('OPEN','INVESTIGATING','RESOLVED','DISMISSED') | NOT NULL, DEFAULT 'OPEN' |
| description | TEXT | NOT NULL |
| source | VARCHAR(255) | |
| metadata | JSONB | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
| INDEX(tenant_id, severity) | | |
| INDEX(tenant_id, status) | | |
| INDEX(tenant_id, created_at) | | |

### audit_logs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| tenant_id | UUID | FK→tenants(id) ON DELETE CASCADE, NOT NULL |
| user_id | UUID | FK→users(id) ON DELETE SET NULL |
| action | VARCHAR(50) | NOT NULL |
| entity_type | VARCHAR(50) | |
| entity_id | UUID | |
| details | JSONB | |
| ip_address | INET | |
| user_agent | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| INDEX(tenant_id, created_at) | | |
| INDEX(tenant_id, action) | | |

### refresh_tokens
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK→users(id) ON DELETE CASCADE, NOT NULL |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| INDEX(token_hash) | | |
| INDEX(user_id) | | |

## BACKEND INTERFACES

### req.user (set by authenticate middleware)
```js
req.user = { id: 'uuid', tenantId: 'uuid', role: 'ADMIN|MANAGER|USER', email: 'string', name: 'string' }
```

### AppError class (src/utils/AppError.js)
```js
class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}
module.exports = AppError;
```

### authenticate middleware (src/middleware/authenticate.js)
```js
// Verifies JWT from Authorization: Bearer <token> header
// Sets req.user = { id, tenantId, role, email, name }
// Returns 401 if invalid/missing token
module.exports = (req, res, next) => { ... };
```

### authorize middleware (src/middleware/authorize.js)
```js
// Usage: authorize('ADMIN', 'MANAGER')
// Must be used AFTER authenticate
// Returns 403 if user's role not in allowed roles
module.exports = (...allowedRoles) => (req, res, next) => { ... };
```

### validate middleware (src/middleware/validate.js)
```js
// Usage: validate(zodSchema, 'body'|'query'|'params')
// Validates req[source] against Zod schema
// Returns 400 with validation errors if invalid
module.exports = (schema, source = 'body') => (req, res, next) => { ... };
```

### auditLogger utility (src/utils/auditLogger.js)
```js
// Logs an action to the audit_logs table
// Usage: await auditLog(req, { action, entityType, entityId, details })
async function auditLog(req, { action, entityType = null, entityId = null, details = null }) {
  // Uses req.user.tenantId and req.user.id
  // Uses req.ip for ip_address
  // Uses req.get('user-agent') for user_agent
}
module.exports = { auditLog };
```

### pagination utility (src/utils/pagination.js)
```js
// Usage: const result = await paginate(knexQueryBuilder, { page, limit })
// Returns: { data: [...], pagination: { page, limit, total, totalPages } }
async function paginate(queryBuilder, { page = 1, limit = 10 } = {}) { ... }
module.exports = { paginate };
```

### stateMachine utility (src/utils/stateMachine.js)
```js
const VALID_TRANSITIONS = {
  DRAFT: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};
function isValidTransition(currentStatus, newStatus) {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}
module.exports = { isValidTransition, VALID_TRANSITIONS };
```

### database config (src/config/database.js)
```js
// Exports configured knex instance
const knex = require('knex')(knexConfig);
module.exports = knex;
```

### logger utility (src/utils/logger.js)
```js
// Winston logger instance
// Usage: logger.info('message', { meta }); logger.error('message', { meta });
module.exports = logger;
```

## API ROUTES

### Auth Routes (mounted at /api/auth)
- POST /login - Public
- POST /refresh - Public (reads httpOnly cookie)
- POST /logout - Authenticated
- GET /me - Authenticated

### Campaign Routes (mounted at /api/campaigns)
- GET / - Authenticated (all roles) - query: ?page=1&limit=10&status=ACTIVE&search=term&sortBy=created_at&sortOrder=desc
- POST / - Authenticated (ADMIN, MANAGER)
- GET /:id - Authenticated (all roles)
- PATCH /:id - Authenticated (ADMIN, MANAGER)
- DELETE /:id - Authenticated (ADMIN only)
- GET /:id/members - Authenticated (all roles)
- POST /:id/members - Authenticated (ADMIN, MANAGER) - body: { userId }
- DELETE /:id/members/:userId - Authenticated (ADMIN, MANAGER)

### Security Event Routes (mounted at /api/security-events)
- GET / - Authenticated (all roles) - query: ?page=1&limit=10&severity=CRITICAL&status=OPEN&type=LOGIN_FAILED&search=term&sortBy=created_at&sortOrder=desc
- POST / - Authenticated (ADMIN, MANAGER)
- GET /:id - Authenticated (all roles)
- PATCH /:id - Authenticated (ADMIN, MANAGER)

### Audit Log Routes (mounted at /api/audit-logs)
- GET / - Authenticated (ADMIN only) - query: ?page=1&limit=10&action=CAMPAIGN_CREATED&entityType=campaign&sortBy=created_at&sortOrder=desc

### User Routes (mounted at /api/users)
- GET / - Authenticated (all roles) - query: ?page=1&limit=10&role=ADMIN&search=term
- POST / - Authenticated (ADMIN only)
- PATCH /:id - Authenticated (ADMIN only)

### Dashboard Routes (mounted at /api/dashboard)
- GET /stats - Authenticated (all roles)

## ROUTE IMPORTS IN app.js
```js
const authRoutes = require('./modules/auth/auth.routes');
const campaignRoutes = require('./modules/campaigns/campaign.routes');
const eventRoutes = require('./modules/events/event.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const userRoutes = require('./modules/users/user.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/security-events', eventRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
```

## SEED DATA

### Tenant IDs (fixed UUIDs for consistency)
- Tenant A (CyberShield Corp): `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- Tenant B (SentinelOps Inc): `b2c3d4e5-f6a7-8901-bcde-f12345678901`

### User IDs (fixed UUIDs)
- admin@cybershield.io (ADMIN, Tenant A): `u1000001-0000-0000-0000-000000000001`
- manager@cybershield.io (MANAGER, Tenant A): `u1000002-0000-0000-0000-000000000002`
- analyst@cybershield.io (USER, Tenant A): `u1000003-0000-0000-0000-000000000003`
- admin@sentinelops.io (ADMIN, Tenant B): `u2000001-0000-0000-0000-000000000001`
- manager@sentinelops.io (MANAGER, Tenant B): `u2000002-0000-0000-0000-000000000002`

### All passwords: Password123!

## RBAC MATRIX
| Action | ADMIN | MANAGER | USER |
|--------|-------|---------|------|
| View campaigns | ✅ | ✅ | ✅ |
| Create campaigns | ✅ | ✅ | ❌ |
| Update campaigns | ✅ | ✅ | ❌ |
| Delete campaigns | ✅ | ❌ | ❌ |
| Assign/remove campaign members | ✅ | ✅ | ❌ |
| View security events | ✅ | ✅ | ✅ |
| Create security events | ✅ | ✅ | ❌ |
| Update security events | ✅ | ✅ | ❌ |
| View audit logs | ✅ | ❌ | ❌ |
| View user list | ✅ | ✅ | ✅ |
| Create users | ✅ | ❌ | ❌ |
| Update users | ✅ | ❌ | ❌ |

## BACKEND PACKAGE.JSON DEPENDENCIES
```json
{
  "dependencies": {
    "express": "^4.21.0",
    "knex": "^3.1.0",
    "pg": "^8.13.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.0",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.4.0",
    "winston": "^3.14.0",
    "cookie-parser": "^1.4.6",
    "uuid": "^10.0.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "nodemon": "^3.1.0"
  }
}
```

## FRONTEND PACKAGE.JSON DEPENDENCIES
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.56.0",
    "axios": "^1.7.7",
    "react-hot-toast": "^2.4.1",
    "@heroicons/react": "^2.1.5",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

## ENV VARS
```
# Backend
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deeptrace
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5000/api
```
