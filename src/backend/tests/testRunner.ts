/**
 * Master Unit Test Runner for CivicFix Backend Modules
 */
import { runAuthUnitTests, TestResult } from './auth.service.test';
import { runIssueUnitTests } from './issue.service.test';

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestResult[];
}

export async function runAllBackendUnitTests(): Promise<TestSuiteSummary> {
  const start = performance.now();
  const authResults = await runAuthUnitTests();
  const issueResults = await runIssueUnitTests();
  const allResults = [...authResults, ...issueResults];

  const total = allResults.length;
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  const durationMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    total,
    passed,
    failed,
    durationMs,
    results: allResults
  };
}
