import { PermissionService } from '../services/PermissionService';
import { Capability } from '../auth/Capability';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runPermissionTests() {
  console.log('Running RBAC Permission Matrix Unit Tests...');

  assert(PermissionService.hasCapability('ADMIN', Capability.INFRASTRUCTURE_WRITE), 'ADMIN must possess INFRASTRUCTURE_WRITE');
  assert(!PermissionService.hasCapability('STAFF', Capability.INFRASTRUCTURE_WRITE), 'STAFF must NOT possess INFRASTRUCTURE_WRITE');

  console.log('✅ RBAC Permission Matrix Unit Tests Passed (0 errors)');
  return true;
}
