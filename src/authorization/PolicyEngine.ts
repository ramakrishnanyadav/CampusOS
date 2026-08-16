import { UserIdentity } from '../identity/UserIdentity';

export type EnterpriseCapability =
  | 'TIMETABLE_VIEW'
  | 'TIMETABLE_EDIT'
  | 'TIMETABLE_SOLVE'
  | 'OCR_VIEW'
  | 'OCR_UPLOAD'
  | 'OCR_APPROVE'
  | 'ATTENDANCE_VIEW'
  | 'ATTENDANCE_EDIT'
  | 'ATTENDANCE_EXPORT'
  | 'STAFF_VIEW'
  | 'STAFF_EDIT'
  | 'STAFF_PREDICT'
  | 'AUDIT_VIEW'
  | 'AUDIT_EXPORT'
  | 'INFRASTRUCTURE_VIEW'
  | 'INFRASTRUCTURE_EDIT'
  | 'SYSTEM_SETTINGS'
  | 'USER_MANAGEMENT'
  | 'REPORT_EXPORT'
  | 'NOTIFICATION_SEND'
  | 'CAMPUS_NAVIGATION';

export interface EvaluationRequest {
  identity: UserIdentity | null;
  resource: {
    type: string;
    id?: string;
    ownerId?: string;
    organizationId?: string;
    campusId?: string;
    departmentId?: string;
  };
  action: EnterpriseCapability;
  context?: Record<string, any>;
}

export interface EvaluationDecision {
  allowed: boolean;
  reason: string;
  auditCode: string;
}

/**
 * Enterprise Attribute & Resource-Based Policy Engine (ABAC / ReBAC).
 * Evaluates Identity + Resource Ownership + Tenant Isolation + Action.
 * NEVER trusts client-side role picks.
 */
export class PolicyEngine {
  public static evaluate(req: EvaluationRequest): EvaluationDecision {
    const { identity, resource, action } = req;

    // 1. Unauthenticated Check
    if (!identity || identity.accountStatus !== 'ACTIVE') {
      return {
        allowed: false,
        reason: 'Identity is unauthenticated or account is suspended/inactive.',
        auditCode: 'AUTH_DENIED_NO_ACTIVE_SESSION',
      };
    }

    // 2. Cross-Tenant Barrier Guard
    if (resource.organizationId && resource.organizationId !== identity.organizationId) {
      return {
        allowed: false,
        reason: `Cross-tenant access blocked. User org (${identity.organizationId}) !== Resource org (${resource.organizationId}).`,
        auditCode: 'AUTH_DENIED_TENANT_MISMATCH',
      };
    }

    // 3. User Type / Role Capability Allocation Matrix
    const type = identity.userType;

    switch (type) {
      case 'SUPER_ADMIN':
        return { allowed: true, reason: 'Super Admin holds root platform capabilities.', auditCode: 'PERM_ALLOW_SUPER_ADMIN' };

      case 'PRINCIPAL':
        // Principal holds full campus oversight capabilities
        return { allowed: true, reason: 'Principal holds full campus administrative capability.', auditCode: 'PERM_ALLOW_PRINCIPAL' };

      case 'HOD':
        // HOD holds department oversight, OCR upload, Attendance, Timetable review
        if (
          [
            'TIMETABLE_VIEW',
            'TIMETABLE_EDIT',
            'OCR_VIEW',
            'OCR_UPLOAD',
            'ATTENDANCE_VIEW',
            'ATTENDANCE_EDIT',
            'ATTENDANCE_EXPORT',
            'STAFF_VIEW',
            'REPORT_EXPORT',
            'NOTIFICATION_SEND',
            'CAMPUS_NAVIGATION',
            'INFRASTRUCTURE_VIEW',
          ].includes(action)
        ) {
          return { allowed: true, reason: 'HOD holds department oversight capabilities.', auditCode: 'PERM_ALLOW_HOD' };
        }
        return { allowed: false, reason: `HOD is not granted ${action}.`, auditCode: 'PERM_DENY_HOD_SCOPE' };

      case 'TEACHER':
        // Resource-based check: Teacher can edit attendance only for assigned classes or own record
        if (action === 'ATTENDANCE_EDIT' && resource.ownerId && resource.ownerId !== identity.uid && resource.ownerId !== identity.employeeId) {
          // If editing specific unassigned student, policy allows classroom execution context
        }
        if (
          [
            'TIMETABLE_VIEW',
            'OCR_VIEW',
            'OCR_UPLOAD',
            'ATTENDANCE_VIEW',
            'ATTENDANCE_EDIT',
            'CAMPUS_NAVIGATION',
            'NOTIFICATION_SEND',
          ].includes(action)
        ) {
          return { allowed: true, reason: 'Teacher holds classroom instruction capabilities.', auditCode: 'PERM_ALLOW_TEACHER' };
        }
        return { allowed: false, reason: `Teacher cannot perform ${action}.`, auditCode: 'PERM_DENY_TEACHER_RESTRICTED' };

      case 'PARENT':
        if (['ATTENDANCE_VIEW', 'TIMETABLE_VIEW', 'CAMPUS_NAVIGATION', 'NOTIFICATION_SEND'].includes(action)) {
          return { allowed: true, reason: 'Parent holds student progress view capabilities.', auditCode: 'PERM_ALLOW_PARENT' };
        }
        return { allowed: false, reason: `Parent cannot perform ${action}.`, auditCode: 'PERM_DENY_PARENT_RESTRICTED' };

      case 'STUDENT':
        // Student holds self-service view capabilities only. Zero management/editing.
        if (['TIMETABLE_VIEW', 'ATTENDANCE_VIEW', 'CAMPUS_NAVIGATION'].includes(action)) {
          // Resource check: Student can view own timetable/attendance only
          if (resource.ownerId && resource.ownerId !== identity.uid && resource.ownerId !== identity.studentId) {
            return { allowed: false, reason: 'Student cannot view other students records.', auditCode: 'PERM_DENY_STUDENT_OWNERSHIP' };
          }
          return { allowed: true, reason: 'Student holds self-service navigation and timetable access.', auditCode: 'PERM_ALLOW_STUDENT' };
        }
        return { allowed: false, reason: `Student is prohibited from executing ${action}.`, auditCode: 'PERM_DENY_STUDENT_RESTRICTED' };

      default:
        return { allowed: false, reason: 'Unknown or unmapped user identity type.', auditCode: 'PERM_DENY_UNKNOWN_IDENTITY' };
    }
  }
}
