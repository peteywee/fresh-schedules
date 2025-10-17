/**
 * @fileoverview Authentication middleware for the Scheduler API.
 * Verifies Firebase ID tokens and extracts user information including roles.
 */
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

/**
 * Extended Express Request with authenticated user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: 'admin' | 'manager' | 'staff';
    orgId?: string;
  };
}

/**
 * Middleware to verify Firebase ID tokens and extract user claims.
 * Expects an Authorization header with format: "Bearer <token>"
 * Sets req.user with the verified user information including role from custom claims.
 */
export async function authenticateFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ ok: false, error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Extract user information from the decoded token
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role as 'admin' | 'manager' | 'staff' | undefined,
      orgId: decodedToken.orgId as string | undefined,
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ ok: false, error: 'Invalid or expired token' });
    return;
  }
}

/**
 * Middleware factory to require specific roles.
 * Use after authenticateFirebaseToken middleware.
 * @param allowedRoles - Array of roles that are allowed to access the endpoint
 */
export function requireRole(...allowedRoles: Array<'admin' | 'manager' | 'staff'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ ok: false, error: 'Authentication required' });
      return;
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ ok: false, error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
