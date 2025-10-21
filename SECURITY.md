# Security Improvements Documentation

This document describes the security enhancements implemented to address the findings from the PR security review.

## Overview

The following security concerns were identified and addressed:

1. **Insecure Onboarding Token System**
2. **Firestore Rule Self-Assign Vulnerability**
3. **Attendance Ledger Security**
4. **Functions Timezone Robustness**

## 1. Secure Invite Token System

### Problem
The original concern was that a `redeemJoinToken` function might directly use a user-supplied token as `orgId`, allowing arbitrary membership creation to any known org path.

### Solution
Implemented a secure invite token system with the following features:

#### Server-Side Validation (`functions/src/invites.ts`)
- **Single-use tokens**: Tokens are marked as used atomically in a Firestore transaction
- **Expiry checks**: Tokens have an expiration date that is validated before redemption
- **Server-managed**: Tokens can only be created/managed by Cloud Functions, not by clients
- **Authenticated access**: Users must be authenticated to redeem tokens
- **Duplicate prevention**: Checks if user is already a member before adding

#### Firestore Rules (`firebase/firestore.rules`)
```firestore
match /invites/{inviteId} {
  allow get: if isSignedIn();
  allow list: if false;
  allow create, update, delete: if false;  // Server-only
}

match /organizations/{organizationId}/members/{memberId} {
  allow get: if isSignedIn() && (isOwner(memberId) || isOrgManager(organizationId));
  allow list: if isSignedIn() && isOrgManager(organizationId);
  allow create, update, delete: if false;  // Must use Cloud Functions
}
```

#### Usage
```typescript
// Call from client
const result = await functions.httpsCallable('redeemJoinToken')({
  inviteToken: 'actual-invite-token-id'  // NOT org ID
});
```

## 2. Restricted Shift Self-Assignment

### Problem
The shift update rule allowed any authenticated user to update shifts without field restrictions, potentially enabling privilege escalation.

### Solution
Implemented granular update rules with field-level validation:

#### Firestore Rules (`firebase/firestore.rules`)
```firestore
match /organizations/{organizationId}/schedules/{scheduleId}/shifts/{shiftId} {
  // Managers can update any field
  allow update: if isSignedIn() && 
                   request.resource.data.scheduleId == scheduleId && 
                   resource != null &&
                   isOrgManager(organizationId);
  
  // Staff can self-assign ONLY if:
  // - Shift is currently unassigned (assignedUid == null)
  // - They're assigning to themselves
  // - ONLY assignedUid and updatedAt fields change
  allow update: if isSignedIn() &&
                   resource != null &&
                   resource.data.assignedUid == null &&
                   request.resource.data.assignedUid == request.auth.uid &&
                   onlyFieldsChanged(['assignedUid', 'updatedAt']);
}
```

#### Helper Functions
```firestore
function isMemberOfOrg(orgId) {
  return exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
}

function getMemberRole(orgId) {
  return get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data.role;
}

function isOrgManager(orgId) {
  return isMemberOfOrg(orgId) && getMemberRole(orgId) in ['admin', 'manager'];
}

function onlyFieldsChanged(allowedFields) {
  return request.resource.data.diff(resource.data).affectedKeys().hasOnly(allowedFields);
}
```

### Security Benefits
- **Prevents privilege escalation**: Staff cannot modify role, time, or other sensitive fields
- **Enforces single-field updates**: Only `assignedUid` (and timestamp) can change during self-assignment
- **Manager override**: Managers retain full control over shift management
- **Unassigned-only**: Staff can only assign themselves to currently unassigned shifts

## 3. Attendance Ledger Security

### Problem
Attendance records contain sensitive data and must be protected from unauthorized access and tampering.

### Solution
Implemented a secure, append-only attendance ledger:

#### Firestore Rules (`firebase/firestore.rules`)
```firestore
match /attendance_ledger/{entryId} {
  allow read, write: if false;  // No client access
}
```

#### Server-Side Management (`functions/src/attendance.ts`)
- **Hash validation**: Each entry includes a secure HMAC-SHA256 hash
- **Environment validation**: Requires `LEDGER_HASH_SALT` environment variable
- **Structured logging**: Logs operations without leaking sensitive data
- **UTC timestamps**: Uses Firestore Timestamps for consistent timezone handling

#### Environment Configuration
```bash
# Required in Firebase Functions configuration
firebase functions:config:set ledger.hash_salt="your-secure-random-salt"
```

Or in `.env` for local development:
```
LEDGER_HASH_SALT=your-secure-random-salt
```

## 4. Auto Clock-Out Worker

### Problem
Using local timestamps or inconsistent timezone handling could lead to data accuracy issues.

### Solution
Implemented UTC-consistent auto clock-out with the following features:

#### Function Configuration (`functions/src/attendance.ts`)
```typescript
export const autoClockOutWorker = onSchedule(
  {
    schedule: "0 * * * *",  // Runs hourly
    timeZone: "UTC",         // Explicit UTC
    maxInstances: 1,
  },
  async (event) => { ... }
);
```

#### UTC Timestamp Handling
- **Firestore Timestamps**: Uses `Timestamp.now()` and `Timestamp` type throughout
- **No local time conversion**: All timestamps stored as UTC in Firestore
- **Consistent clock-out time**: Uses shift's actual `endTime` (Firestore Timestamp)
- **Server timestamp for updates**: Uses `Timestamp.now()` for audit fields

#### Processing Logic
1. Queries shifts where:
   - Clock-in occurred (`clockInAt != null`)
   - No clock-out (`clockOutAt == null`)
   - No auto clock-out yet (`autoClockOutAt == null`)
   - Shift has ended (`endTime < now`)
2. Batches updates (100 shifts at a time)
3. Sets `clockOutAt` to the shift's `endTime` (not current time)
4. Sets `autoClockOutAt` to current time for audit trail
5. Creates attendance ledger entry with secure hash

## Testing Recommendations

### Unit Tests
```typescript
// Test invite token redemption
- Valid token redemption succeeds
- Expired token is rejected
- Already-used token is rejected
- User already member is rejected
- Unauthenticated user is rejected

// Test shift self-assignment
- Staff can assign themselves to unassigned shift
- Staff cannot assign to already-assigned shift
- Staff cannot modify other fields during assignment
- Manager can update any shift field
```

### Integration Tests
```typescript
// Test auto clock-out worker
- Shifts ending > 1 hour ago are auto clocked out
- Clock-out time equals shift end time
- Attendance ledger entry is created
- Hash is correctly generated
```

## Deployment Checklist

- [ ] Deploy updated Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Set LEDGER_HASH_SALT: `firebase functions:config:set ledger.hash_salt="..."`
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Verify functions are deployed: Check Firebase Console
- [ ] Test invite redemption in staging
- [ ] Test shift self-assignment in staging
- [ ] Monitor auto clock-out worker logs

## Security Maintenance

### Regular Reviews
- Audit attendance ledger hashes monthly
- Review failed auto clock-out attempts
- Monitor invite token usage patterns
- Check for unauthorized member additions

### Incident Response
If unauthorized access is suspected:
1. Review Cloud Functions logs for the time period
2. Check attendance ledger for hash mismatches
3. Audit organization member additions
4. Rotate LEDGER_HASH_SALT if compromised
5. Revoke and regenerate invite tokens

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Cloud Functions Security Best Practices](https://firebase.google.com/docs/functions/security)
- [HMAC Security Guidelines](https://en.wikipedia.org/wiki/HMAC)
