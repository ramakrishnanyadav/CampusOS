import { UserIdentity } from '../identity/UserIdentity';
import { EnterpriseCapability, PolicyEngine } from './PolicyEngine';

export interface ResourceRef {
  type: string;
  id?: string;
  ownerId?: string;
  organizationId?: string;
  campusId?: string;
  departmentId?: string;
}

export class ResourceGuard {
  /**
   * Enforces fine-grained Resource Boundary rules before executing privileged write/edit operations.
   */
  public static assertCanAccess(identity: UserIdentity | null, action: EnterpriseCapability, resource: ResourceRef): void {
    const decision = PolicyEngine.evaluate({ identity, resource, action });
    if (!decision.allowed) {
      throw new Error(`[ResourceGuard Rejection] ${decision.auditCode}: ${decision.reason}`);
    }
  }

  public static canAccess(identity: UserIdentity | null, action: EnterpriseCapability, resource: ResourceRef): boolean {
    return PolicyEngine.evaluate({ identity, resource, action }).allowed;
  }
}
