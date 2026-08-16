import { Request, Response, NextFunction } from 'express';

export interface TenantContextRequest extends Request {
  orgId?: string;
  campusId?: string;
}

export function tenantMiddleware(req: TenantContextRequest, res: Response, next: NextFunction) {
  // Extract tenant header or fallback to default enterprise organization
  const orgHeader = req.headers['x-tenant-id'] || req.headers['x-organization-id'];
  const campusHeader = req.headers['x-campus-id'];

  req.orgId = (Array.isArray(orgHeader) ? orgHeader[0] : orgHeader) || 'org-central-high';
  req.campusId = (Array.isArray(campusHeader) ? campusHeader[0] : campusHeader) || 'campus-main';

  res.setHeader('X-Tenant-ID', req.orgId);
  next();
}
