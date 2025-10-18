# Authentication Security Documentation

This document outlines the security improvements made to address vulnerabilities identified in PR #38 code review.

## Overview

Two critical security improvements have been implemented:

1. **MCP Server**: Enhanced authentication and rate limiting
2. **Shifts API**: Firebase ID token verification with role-based access control

## MCP Server Security

### Configuration

The MCP server now enforces authentication based on the environment:

- **Production**: Authentication is **always required**. The server will fail to accept requests if `MCP_TOKEN` is not set.
- **Development**: Authentication is optional but recommended. A warning is logged if `MCP_TOKEN` is not set.

### Environment Variables

```bash
# Required in production
MCP_TOKEN=your-secure-token-here

# Optional configuration
NODE_ENV=production  # Enforces strict authentication
PORT=4002           # Server port (default: 4002)
MCP_REPO_ROOT=/path/to/repo  # Repository root path
```

### Rate Limiting

The MCP server implements rate limiting to prevent abuse:

- **Production**: 100 requests per 15 minutes per IP address
- **Development**: 1000 requests per 15 minutes per IP address

### Usage

When making requests to the MCP server, include the token in the `x-mcp-token` header:

```bash
curl -H "x-mcp-token: your-secure-token" http://localhost:4002/health
```

## Shifts API Security

### Authentication Mechanism

The Shifts API now uses Firebase Admin SDK to verify ID tokens. The previous `x-role` header authentication (which was easily spoofable) has been replaced with proper token verification.

### How It Works

1. **Client sends request** with Firebase ID token in Authorization header:
   ```
   Authorization: Bearer <firebase-id-token>
   ```

2. **Server verifies token** using Firebase Admin SDK

3. **Extracts user information** from verified token:
   - User ID (`uid`)
   - Email
   - Role (from custom claims)
   - Organization ID (from custom claims)

4. **Enforces role-based access control**:
   - POST `/api/shifts`: Requires `admin` or `manager` role
   - GET `/api/shifts`: All authenticated users

5. **Validates organization boundaries**:
   - Users can only access data from their own organization
   - Cross-organization requests are rejected with 403 Forbidden

### Setting Up Firebase Custom Claims

To use the role-based access control, you must set custom claims on user tokens:

```javascript
// Example: Set custom claims using Firebase Admin SDK
await admin.auth().setCustomUserClaims(uid, {
  role: 'admin',  // or 'manager', 'staff'
  orgId: 'org_123'
});
```

### Client Implementation Example

```typescript
import { getAuth } from 'firebase/auth';

// Get current user's ID token
const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();

// Make authenticated request
const response = await fetch('http://localhost:3333/api/shifts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orgId: 'org_123',
    userId: 'user_456',
    startTime: '2025-10-18T09:00:00Z',
    endTime: '2025-10-18T17:00:00Z',
    role: 'Server'
  })
});
```

### Error Responses

#### 401 Unauthorized
```json
{
  "ok": false,
  "error": "Missing or invalid authorization header"
}
```

#### 403 Forbidden
```json
{
  "ok": false,
  "error": "Insufficient permissions"
}
```

or

```json
{
  "ok": false,
  "error": "Cannot create shifts for other organizations"
}
```

## Migration Guide

### For MCP Server Users

**Before:**
```bash
# No authentication required
curl http://localhost:4002/files
```

**After:**
```bash
# Set environment variable
export MCP_TOKEN=your-secure-token

# Include token in requests
curl -H "x-mcp-token: your-secure-token" http://localhost:4002/files
```

### For Shifts API Users

**Before (INSECURE - DO NOT USE):**
```bash
curl -X POST \
  -H "x-role: admin" \
  -H "Content-Type: application/json" \
  -d '{"orgId":"org_123","userId":"user_456","startTime":"2025-10-18T09:00:00Z","endTime":"2025-10-18T17:00:00Z","role":"Server"}' \
  http://localhost:3333/api/shifts
```

**After:**
```bash
# First, authenticate with Firebase CLI
firebase login

# Obtain Firebase ID token from client SDK
TOKEN=$(firebase auth:print-id-token)

# Use token in Authorization header
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orgId":"org_123","userId":"user_456","startTime":"2025-10-18T09:00:00Z","endTime":"2025-10-18T17:00:00Z","role":"Server"}' \
  http://localhost:3333/api/shifts
```

## Security Best Practices

1. **Never expose MCP_TOKEN** in client-side code or version control
2. **Rotate tokens regularly** in production environments
3. **Use HTTPS** in production to prevent token interception
4. **Set appropriate custom claims** on user tokens with minimal required permissions
5. **Monitor rate limiting** logs to detect potential abuse
6. **Validate organization IDs** match between token claims and request data

## Testing

### Test MCP Server Authentication

```bash
# Should fail without token in production
NODE_ENV=production npm run start
curl http://localhost:4002/health
# Expected: {"error":"Server misconfigured - authentication required"}

# Should succeed with token
curl -H "x-mcp-token: test-token" http://localhost:4002/health
# Expected: {"ok":true,"pid":...}
```

### Test Shifts API Authentication

```bash
# Should fail without Authorization header
curl -X POST http://localhost:3333/api/shifts
# Expected: {"ok":false,"error":"Missing or invalid authorization header"}

# Should fail with invalid token
curl -X POST \
  -H "Authorization: Bearer invalid-token" \
  http://localhost:3333/api/shifts
# Expected: {"ok":false,"error":"Invalid or expired token"}
```

## Troubleshooting

### "MCP_TOKEN must be set in production"
**Solution**: Set the `MCP_TOKEN` environment variable before starting the server in production.

### "Invalid or expired token"
**Solution**: Ensure you're using a valid Firebase ID token. Tokens expire after 1 hour by default.

### "Insufficient permissions"
**Solution**: Verify that the user's custom claims include the correct `role` field with appropriate permissions.

### "Cannot create shifts for other organizations"
**Solution**: Ensure the `orgId` in the request matches the `orgId` in the user's custom claims.

## References

- [Firebase Admin SDK - Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Firebase - Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
