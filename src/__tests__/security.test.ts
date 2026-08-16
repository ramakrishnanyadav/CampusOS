import { PermissionService } from '../services/PermissionService';
import { Capability } from '../auth/Capability';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runSecurityTestSuite() {
  console.log('Running Enterprise Security & Custom Claims Test Suite...');

  // 1. O(1) Role Capability Set Lookup
  assert(PermissionService.hasCapability('ADMIN', Capability.INFRASTRUCTURE_WRITE), 'ADMIN must have INFRASTRUCTURE_WRITE');
  assert(PermissionService.hasCapability('ADMIN', Capability.TIMETABLE_SOLVE), 'ADMIN must have TIMETABLE_SOLVE');
  assert(!PermissionService.hasCapability('STAFF', Capability.INFRASTRUCTURE_WRITE), 'STAFF must NOT have INFRASTRUCTURE_WRITE');
  assert(PermissionService.hasCapability('STAFF', Capability.ATTENDANCE_READ), 'STAFF must have ATTENDANCE_READ');

  // 2. Direct Identity Provider Custom Claims Evaluation
  const customClaims = {
    role: 'STAFF' as const,
    capabilities: [Capability.INFRASTRUCTURE_WRITE, Capability.TIMETABLE_SOLVE],
  };
  assert(
    PermissionService.hasCapability('STAFF', Capability.INFRASTRUCTURE_WRITE, customClaims),
    'Custom claim override must grant INFRASTRUCTURE_WRITE to STAFF'
  );

  // 3. Resource Ownership Verification
  const currentUserId = 'user-001';
  const ownedResourceOwner = 'user-001';
  const unownedResourceOwner = 'user-999';

  assert(PermissionService.isResourceOwner(currentUserId, ownedResourceOwner), 'User must own their own resource');
  // 4. Role Hierarchy & Boundary Assertions
  assert(!PermissionService.hasCapability('PARENT_STUDENT', Capability.TIMETABLE_SOLVE), 'PARENT_STUDENT must NOT have TIMETABLE_SOLVE');
  assert(!PermissionService.hasCapability('PARENT_STUDENT', Capability.CONFIG_WRITE), 'PARENT_STUDENT must NOT have CONFIG_WRITE');

  console.log('✅ All Enterprise Security & Custom Claims Tests Passed Successfully!');
}

