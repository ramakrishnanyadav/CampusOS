import { Capability } from '../auth/Capability';
import { UserRole } from '../auth/PermissionContext';

export const ROLE_CAPABILITIES_MAP: Record<UserRole, Set<Capability>> = {
  ADMIN: new Set(Object.values(Capability)),
  STAFF: new Set([
    Capability.OCR_VIEW,
    Capability.OCR_UPLOAD,
    Capability.OCR_WRITE,
    Capability.TIMETABLE_READ,
    Capability.ATTENDANCE_READ,
    Capability.ATTENDANCE_WRITE,
    Capability.INFRASTRUCTURE_READ,
    Capability.CAMPUS_MAP_VIEW,
  ]),
  PARENT_STUDENT: new Set([
    Capability.TIMETABLE_READ,
    Capability.ATTENDANCE_READ,
    Capability.CAMPUS_MAP_VIEW,
  ]),
};

export interface FirebaseCustomClaims {
  role?: UserRole;
  capabilities?: Capability[];
  orgId?: string;
}

export class PermissionService {
  /**
   * High-Performance O(1) Capability Lookup using ES6 Sets
   */
  public static hasCapability(role: UserRole | string, cap: Capability | string, claims?: FirebaseCustomClaims): boolean {
    const roleStr = String(role || '').toUpperCase();
    if (
      roleStr === 'ADMIN' ||
      roleStr === 'SUPER_ADMIN' ||
      roleStr === 'PRINCIPAL' ||
      roleStr === 'IT_ADMIN' ||
      roleStr === 'DISTRICT_SUPERINTENDENT' ||
      claims?.role === 'ADMIN'
    ) {
      return true;
    }

    // 2. Check direct Identity Provider custom claims first if available
    if (claims?.capabilities && Array.isArray(claims.capabilities)) {
      const claimsSet = new Set<string>(claims.capabilities as string[]);
      if (claimsSet.has(cap)) return true;
    }

    const activeRole = claims?.role || role;

    // 3. Fallback to assigned role capability set (O(1))
    const capsSet = (ROLE_CAPABILITIES_MAP as Record<string, Set<Capability>>)[activeRole] as Set<Capability | string> | undefined;
    return capsSet ? capsSet.has(cap) : false;
  }

  /**
   * Resource Ownership Verification Middleware
   */
  public static isResourceOwner(userId: string, resourceOwnerId: string): boolean {
    return userId === resourceOwnerId;
  }
}
