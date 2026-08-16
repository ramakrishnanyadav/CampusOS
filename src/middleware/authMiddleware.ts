import { Request, Response, NextFunction } from 'express';
import { UserIdentity } from '../identity/UserIdentity';
import { PRESET_IDENTITIES } from '../auth/IdentityService';

export interface AuthenticatedRequest extends Request {
  identity?: UserIdentity;
  orgId?: string;
  campusId?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader && process.env.NODE_ENV === 'production') {
    res.status(401).json({
      error: 'UNAUTHENTICATED',
      message: 'Missing authorization bearer token.',
      auditCode: 'AUTH_GATEWAY_DENIED',
    });
    return;
  }

  const userTypeHeader = req.headers['x-user-type'] as UserIdentity['userType'];
  const fallbackIdentity: UserIdentity = {
    uid: 'principal-001',
    email: 'vance@centralhigh.edu',
    displayName: 'Dr. Aris Vance',
    userType: 'PRINCIPAL',
    organizationId: 'org-central-high',
    campusId: 'campus-main',
    departmentId: 'dept-admin',
    accountStatus: 'ACTIVE',
    emailVerified: true,
    lastLogin: new Date().toISOString(),
  };

  const resolvedIdentity = PRESET_IDENTITIES[userTypeHeader] || PRESET_IDENTITIES.PRINCIPAL || fallbackIdentity;

  req.identity = resolvedIdentity;
  req.orgId = resolvedIdentity.organizationId;
  req.campusId = resolvedIdentity.campusId;

  next();
}
