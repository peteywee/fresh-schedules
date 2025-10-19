# Security Features Usage Guide

This guide provides examples of how to use the secure features implemented in Fresh Schedules.

## Invite Token System

### Creating Invite Tokens (Admin/Manager)

Invite tokens should be created via a Cloud Function (to be implemented) or directly in Firestore by administrators:

```typescript
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const db = getFirestore();

async function createInviteToken(
  organizationId: string,
  role: 'admin' | 'manager' | 'staff',
  createdBy: string,
  expiryDays: number = 7
): Promise<string> {
  const inviteRef = db.collection('invites').doc();
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);
  
  await inviteRef.set({
    organizationId,
    role,
    createdBy,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(expiresAt),
    used: false,
  });
  
  return inviteRef.id;
}
```

### Redeeming Invite Tokens (Client)

From your client application:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const redeemToken = httpsCallable(functions, 'redeemJoinToken');

async function joinOrganization(inviteToken: string) {
  try {
    const result = await redeemToken({ inviteToken });
    console.log('Successfully joined organization:', result.data);
    // result.data = { success: true, organizationId: '...', role: 'staff' }
  } catch (error) {
    console.error('Failed to redeem invite:', error);
    // Handle errors:
    // - unauthenticated: User must sign in first
    // - not-found: Invalid token
    // - failed-precondition: Token expired or already used
    // - already-exists: Already a member
  }
}
```

## Shift Self-Assignment

### Staff Assigning Themselves to a Shift

```typescript
import { getFirestore, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

async function selfAssignToShift(
  organizationId: string,
  scheduleId: string,
  shiftId: string
) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Must be authenticated');
  }
  
  const shiftRef = doc(
    db,
    `organizations/${organizationId}/schedules/${scheduleId}/shifts/${shiftId}`
  );
  
  try {
    // This will only succeed if:
    // 1. User is authenticated and a member of the organization
    // 2. Shift is currently unassigned (assignedUid == null)
    // 3. Only assignedUid and updatedAt fields are being changed
    await updateDoc(shiftRef, {
      assignedUid: currentUser.uid,
      updatedAt: Timestamp.now(),
    });
    
    console.log('Successfully assigned to shift');
  } catch (error) {
    console.error('Failed to self-assign:', error);
    // Common reasons for failure:
    // - Shift already assigned
    // - Not a member of the organization
    // - Trying to modify other fields
  }
}
```

### Manager Updating a Shift

Managers can update any field:

```typescript
async function updateShift(
  organizationId: string,
  scheduleId: string,
  shiftId: string,
  updates: {
    assignedUid?: string;
    startTime?: Timestamp;
    endTime?: Timestamp;
    role?: string;
    // ... any other shift fields
  }
) {
  const shiftRef = doc(
    db,
    `organizations/${organizationId}/schedules/${scheduleId}/shifts/${shiftId}`
  );
  
  await updateDoc(shiftRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}
```

## Checking Organization Membership

### Client-Side Membership Check

```typescript
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

async function checkMembership(organizationId: string) {
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return null;
  }
  
  try {
    const memberRef = doc(
      db,
      `organizations/${organizationId}/members/${currentUser.uid}`
    );
    const memberDoc = await getDoc(memberRef);
    
    if (memberDoc.exists()) {
      const memberData = memberDoc.data();
      return {
        role: memberData.role as 'admin' | 'manager' | 'staff',
        joinedAt: memberData.joinedAt,
        invitedBy: memberData.invitedBy,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to check membership:', error);
    return null;
  }
}

// Usage
const membership = await checkMembership('org-123');
if (membership) {
  console.log(`You are a ${membership.role} in this organization`);
} else {
  console.log('You are not a member of this organization');
}
```

## Attendance Tracking

### Clock In (Client)

```typescript
async function clockIn(
  organizationId: string,
  scheduleId: string,
  shiftId: string
) {
  const shiftRef = doc(
    db,
    `organizations/${organizationId}/schedules/${scheduleId}/shifts/${shiftId}`
  );
  
  // Only managers or the assigned staff member should be able to clock in
  await updateDoc(shiftRef, {
    clockInAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}
```

### Clock Out (Client)

```typescript
async function clockOut(
  organizationId: string,
  scheduleId: string,
  shiftId: string
) {
  const shiftRef = doc(
    db,
    `organizations/${organizationId}/schedules/${scheduleId}/shifts/${shiftId}`
  );
  
  await updateDoc(shiftRef, {
    clockOutAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}
```

### Auto Clock-Out

The `autoClockOutWorker` function runs automatically every hour. No client action is required.

**What happens:**
1. Function queries all shifts that have ended but haven't been clocked out
2. Automatically sets `clockOutAt` to the shift's `endTime`
3. Sets `autoClockOutAt` to the current timestamp for audit
4. Creates an attendance ledger entry (not accessible to clients)

**Shift states:**
- `clockInAt` exists, `clockOutAt` null, `endTime` passed → Will be auto-clocked out
- `clockInAt` null → Won't be auto-clocked out (staff never showed up)
- `clockOutAt` exists → Already clocked out, no action needed

## Environment Configuration

### Required Environment Variables

For Cloud Functions:

```bash
# Set in Firebase Functions config
firebase functions:config:set ledger.hash_salt="$(openssl rand -hex 32)"

# Or in .env for local development
LEDGER_HASH_SALT=your-64-character-secure-random-string
```

### Verifying Configuration

```typescript
// In your function code
const salt = process.env.LEDGER_HASH_SALT;
if (!salt) {
  throw new Error('LEDGER_HASH_SALT is not configured');
}
```

## Security Best Practices

### Do's ✅

- **Always validate user authentication** before allowing operations
- **Use the invite token system** for onboarding new members
- **Let managers handle** complex shift operations
- **Use Firestore Timestamps** for all time-related fields
- **Check membership** before allowing organization-specific operations

### Don'ts ❌

- **Never try to write directly** to the `members` collection (use Cloud Functions)
- **Never try to access** the `attendance_ledger` collection from clients
- **Don't modify multiple fields** when self-assigning to shifts
- **Don't use client timestamps** (use `serverTimestamp()` or `Timestamp.now()`)
- **Don't share invite tokens** publicly or via insecure channels

## Error Handling

### Common Error Messages

```typescript
// Invite token errors
'User must be authenticated to redeem an invite token'
'Invalid invite token'
'This invite has already been used'
'This invite has expired'
'You are already a member of this organization'

// Shift assignment errors
'permission-denied' // Not authorized or trying to modify restricted fields
```

### Proper Error Handling

```typescript
try {
  await someOperation();
} catch (error: any) {
  if (error.code === 'permission-denied') {
    // User doesn't have permission
    showError('You don\'t have permission to perform this action');
  } else if (error.code === 'not-found') {
    // Resource doesn't exist
    showError('The requested resource was not found');
  } else if (error.code === 'already-exists') {
    // Duplicate operation
    showError('This action has already been completed');
  } else {
    // Unexpected error
    console.error('Unexpected error:', error);
    showError('An unexpected error occurred. Please try again.');
  }
}
```

## Testing

### Testing Invite Redemption

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Invite Token Redemption', () => {
  it('should allow valid token redemption', async () => {
    const inviteToken = await createTestInvite();
    const result = await redeemToken({ inviteToken });
    
    expect(result.data.success).toBe(true);
    expect(result.data.organizationId).toBeDefined();
  });
  
  it('should reject expired tokens', async () => {
    const expiredToken = await createTestInvite({ expiryDays: -1 });
    
    await expect(
      redeemToken({ inviteToken: expiredToken })
    ).rejects.toThrow('This invite has expired');
  });
  
  it('should reject already-used tokens', async () => {
    const inviteToken = await createTestInvite();
    await redeemToken({ inviteToken }); // First redemption
    
    await expect(
      redeemToken({ inviteToken }) // Second redemption
    ).rejects.toThrow('This invite has already been used');
  });
});
```

### Testing Shift Self-Assignment

```typescript
describe('Shift Self-Assignment', () => {
  it('should allow staff to self-assign to unassigned shift', async () => {
    const shiftId = await createUnassignedShift();
    
    await expect(
      updateDoc(shiftRef, {
        assignedUid: currentUser.uid,
        updatedAt: Timestamp.now()
      })
    ).resolves.not.toThrow();
  });
  
  it('should prevent self-assignment to assigned shift', async () => {
    const shiftId = await createAssignedShift();
    
    await expect(
      updateDoc(shiftRef, {
        assignedUid: currentUser.uid,
        updatedAt: Timestamp.now()
      })
    ).rejects.toThrow('permission-denied');
  });
  
  it('should prevent modifying other fields during self-assignment', async () => {
    const shiftId = await createUnassignedShift();
    
    await expect(
      updateDoc(shiftRef, {
        assignedUid: currentUser.uid,
        role: 'admin', // Trying to escalate privileges
        updatedAt: Timestamp.now()
      })
    ).rejects.toThrow('permission-denied');
  });
});
```

## Monitoring and Auditing

### What to Monitor

1. **Failed invite redemptions** - May indicate token guessing attempts
2. **Failed shift assignments** - May indicate unauthorized access attempts
3. **Auto clock-out patterns** - Track attendance accuracy
4. **Attendance ledger integrity** - Verify hashes match expected values

### Sample Monitoring Query

```typescript
// Get failed authentication attempts
const failedAttempts = await db
  .collection('audit_logs')
  .where('type', '==', 'invite_redemption_failed')
  .where('timestamp', '>', last24Hours)
  .get();

console.log(`Failed redemptions in last 24h: ${failedAttempts.size}`);
```

For more details, see [SECURITY.md](./SECURITY.md).
