import { runSecurityTestSuite } from './security.test';
import { runSchedulerTests } from './scheduler.test';
import { runStaffingTests } from './staffing.test';
import { runOcrIntegrationTests } from './ocrIntegration.test';
import { runPolicyEngineTests } from './policyEngine.test';
import { runPermissionTests } from './permission.test';
import { runApiRouteTests } from './apiRoutes.test';

console.log('----------------------------------------------------');
console.log('🚀 CampusOS Master Enterprise Test Suite Aggregator');
console.log('----------------------------------------------------');

try {
  runPermissionTests();
  runPolicyEngineTests();
  runSecurityTestSuite();
  runSchedulerTests();
  runStaffingTests();
  runOcrIntegrationTests();
  runApiRouteTests();

  console.log('----------------------------------------------------');
  console.log('🎉 ALL SUITES PASSED CLEANLY (Zero Failures)');
  console.log('----------------------------------------------------');
} catch (err: any) {
  console.error('❌ TEST SUITE FAILURE:', err.message || err);
  process.exit(1);
}
