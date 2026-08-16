import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { EnterpriseCapability, PolicyEngine } from '../authorization/PolicyEngine';

export function requireCapability(requiredCapability: EnterpriseCapability) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const identity = req.identity;
    const orgId = req.orgId || identity?.organizationId;

    const decision = PolicyEngine.evaluate({
      identity: identity || null,
      resource: { type: 'API_ENDPOINT', organizationId: orgId },
      action: requiredCapability,
      context: {
        time: new Date().toISOString(),
        isSchoolHours: true,
        emergencyMode: false,
      },
    });

    if (!decision.allowed) {
      res.status(403).json({
        error: 'FORBIDDEN',
        auditCode: decision.auditCode,
        message: decision.reason,
      });
      return;
    }

    next();
  };
}
