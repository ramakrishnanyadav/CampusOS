import { UserIdentity } from '../identity/UserIdentity';
import { EnterpriseCapability, PolicyEngine } from './PolicyEngine';

export class CapabilityResolver {
  public static resolveCapabilities(identity: UserIdentity | null): Set<EnterpriseCapability> {
    if (!identity) return new Set();

    const allCapabilities: EnterpriseCapability[] = [
      'TIMETABLE_VIEW',
      'TIMETABLE_EDIT',
      'TIMETABLE_SOLVE',
      'OCR_VIEW',
      'OCR_UPLOAD',
      'OCR_APPROVE',
      'ATTENDANCE_VIEW',
      'ATTENDANCE_EDIT',
      'ATTENDANCE_EXPORT',
      'STAFF_VIEW',
      'STAFF_EDIT',
      'STAFF_PREDICT',
      'AUDIT_VIEW',
      'AUDIT_EXPORT',
      'INFRASTRUCTURE_VIEW',
      'INFRASTRUCTURE_EDIT',
      'SYSTEM_SETTINGS',
      'USER_MANAGEMENT',
      'REPORT_EXPORT',
      'NOTIFICATION_SEND',
      'CAMPUS_NAVIGATION',
    ];

    const granted = new Set<EnterpriseCapability>();

    allCapabilities.forEach((cap) => {
      const decision = PolicyEngine.evaluate({
        identity,
        resource: { type: 'SYSTEM', organizationId: identity.organizationId },
        action: cap,
      });
      if (decision.allowed) {
        granted.add(cap);
      }
    });

    return granted;
  }
}
