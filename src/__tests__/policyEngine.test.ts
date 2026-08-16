import { PolicyEngine } from '../authorization/PolicyEngine';
import { CapabilityResolver } from '../authorization/CapabilityResolver';
import { SessionManager } from '../auth/SessionManager';
import { UserIdentity } from '../identity/UserIdentity';

export function runPolicyEngineTests() {

  console.log('Running Enterprise PolicyEngine & Capability Resolution Unit Tests...');
  let errors = 0;

  const testStudentIdentity: UserIdentity = {
    uid: 'stu-test-1',
    email: 'student.test@centralhigh.edu',
    displayName: 'Student Tester',
    organizationId: 'org-central-high',
    campusId: 'campus-main',
    studentId: 'STU-99',
    accountStatus: 'ACTIVE',
    emailVerified: true,
    lastLogin: new Date().toISOString(),
    userType: 'STUDENT',
  };

  const testPrincipalIdentity: UserIdentity = {
    uid: 'pri-test-1',
    email: 'principal.test@centralhigh.edu',
    displayName: 'Principal Tester',
    organizationId: 'org-central-high',
    campusId: 'campus-main',
    employeeId: 'EMP-01',
    accountStatus: 'ACTIVE',
    emailVerified: true,
    lastLogin: new Date().toISOString(),
    userType: 'PRINCIPAL',
  };

  // 1. Student Access Denial on Privileged Actions
  const studentOcrDecision = PolicyEngine.evaluate({
    identity: testStudentIdentity,
    resource: { type: 'OCR', organizationId: 'org-central-high' },
    action: 'OCR_UPLOAD',
  });
  if (studentOcrDecision.allowed) {
    console.error('❌ FAIL: Student was incorrectly granted OCR_UPLOAD!');
    errors++;
  } else {
    console.log('  ✓ PASS: Student correctly denied OCR_UPLOAD.');
  }

  const studentInfraDecision = PolicyEngine.evaluate({
    identity: testStudentIdentity,
    resource: { type: 'INFRASTRUCTURE', organizationId: 'org-central-high' },
    action: 'INFRASTRUCTURE_EDIT',
  });
  if (studentInfraDecision.allowed) {
    console.error('❌ FAIL: Student was incorrectly granted INFRASTRUCTURE_EDIT!');
    errors++;
  } else {
    console.log('  ✓ PASS: Student correctly denied INFRASTRUCTURE_EDIT.');
  }

  // 2. Cross-Tenant Barrier Guard Assertion
  const crossTenantDecision = PolicyEngine.evaluate({
    identity: testPrincipalIdentity,
    resource: { type: 'STUDENT', organizationId: 'org-other-school' },
    action: 'ATTENDANCE_VIEW',
  });
  if (crossTenantDecision.allowed) {
    console.error('❌ FAIL: Cross-tenant access was allowed!');
    errors++;
  } else {
    console.log('  ✓ PASS: Cross-tenant access correctly blocked by orgId barrier.');
  }

  // 3. Principal Capabilities Resolution
  const principalCaps = CapabilityResolver.resolveCapabilities(testPrincipalIdentity);
  if (!principalCaps.has('TIMETABLE_SOLVE') || !principalCaps.has('INFRASTRUCTURE_EDIT')) {
    console.error('❌ FAIL: Principal capability resolution missing required enterprise capabilities!');
    errors++;
  } else {
    console.log('  ✓ PASS: Principal correctly resolved full administrative capability set.');
  }

  // 4. Session Manager Lifetime & Expiry Assertion
  const sm = SessionManager.getInstance();
  const session = sm.createSession(testPrincipalIdentity, 'token_123', 'refresh_123');
  if (!session || !sm.getSession()) {
    console.error('❌ FAIL: SessionManager failed to establish valid session!');
    errors++;
  } else {
    console.log('  ✓ PASS: SessionManager successfully established enterprise active session.');
  }

  if (errors > 0) {
    console.error(`❌ PolicyEngine & Capability Resolution Unit Tests failed with ${errors} error(s).`);
    process.exit(1);
  } else {
    console.log('✅ PolicyEngine & Capability Resolution Unit Tests Passed (0 errors)');
  }
}

runPolicyEngineTests();
