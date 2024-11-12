/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import type {
  Hook,
  HookResult,
  Test,
  TestResult,
  TestReport,
} from "./TestCase";
import TestCase from "./TestCase";
import { cpus } from "os";

class Run {
  private readonly MAX_PARALLEL_TESTS = cpus().length || 4;

  constructor(private testCase: TestCase) {}

  // Define a common interface for Test and Hook
  private async execute(
    executable: Test | Hook,
  ): Promise<TestResult | HookResult> {
    const { description, fn, options } = executable;
    const { timeout, skip, if: condition, softFail, retry } = options;

    const result: TestResult | HookResult = {
      description,
      retries: 0,
      status: "passed",
    };

    if (
      skip ||
      condition === undefined ||
      condition === null ||
      !(await this.evaluateCondition(condition))
    ) {
      result.status = "skipped";
      return result;
    }

    let lastError: any;

    while (result.retries <= retry) {
      try {
        if (timeout > 0) {
          await Promise.race([
            fn(),
            new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(new Error(`${description} exceeded ${timeout} ms.`)),
                timeout,
              ),
            ),
          ]);
        } else {
          await fn();
        }

        // If it succeeds, we exit the loop with a passed result
        return result;
      } catch (error: any) {
        lastError = error; // Keep track of the last error
        result.retries++;

        // If softFail is set and this was the last attempt, mark as "soft-fail"
        if (result.retries > retry) {
          if (softFail) {
            result.status = "soft-fail";
            result.error = {
              message: `Soft failure: ${lastError.message}`,
              stack: lastError.stack,
            };
          } else {
            result.status = "failed";
            result.error = {
              message: lastError.message,
              stack: lastError.stack,
            };
          }
          return result;
        }
      }
    }

    return result;
  }

  private async evaluateCondition(
    condition: boolean | (() => boolean | Promise<boolean> | null | undefined),
  ): Promise<boolean> {
    if (typeof condition === "function") {
      return (await condition()) ?? false;
    }
    return condition ?? true;
  }

  // Run all tests and hooks in the TestCase
  async run(): Promise<TestReport> {
    const report: TestReport = {
      stats: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        softFailed: 0,
      },
      status: "passed",
      description: this.testCase.description,
      tests: [],
      hooks: [],
    };

    // Run beforeAll hooks
    if (this.testCase.hooks.beforeAll) {
      const beforeAllResult = await this.execute(this.testCase.hooks.beforeAll);
      report.hooks.push(beforeAllResult as HookResult);
    }

    // Determine which tests to run: onlyTests or all tests
    const testsToRun =
      this.testCase.onlyTests.length > 0
        ? this.testCase.onlyTests
        : this.testCase.tests;

    report.stats.total = testsToRun.length;

    // Run tests in batches for parallelization
    for (let i = 0; i < testsToRun.length; i += this.MAX_PARALLEL_TESTS) {
      const batch = testsToRun.slice(i, i + this.MAX_PARALLEL_TESTS);

      const results = await Promise.all(
        batch.map(async (test) => {
          // Run beforeEach hook
          if (this.testCase.hooks.beforeEach) {
            const beforeEachResult = await this.execute(
              this.testCase.hooks.beforeEach,
            );
            report.hooks.push(beforeEachResult as HookResult);
          }

          const result = (await this.execute(test)) as TestResult;
          report.tests.push(result);

          // Run afterEach hook
          if (this.testCase.hooks.afterEach) {
            const afterEachResult = await this.execute(
              this.testCase.hooks.afterEach,
            );
            report.hooks.push(afterEachResult as HookResult);
          }

          return result;
        }),
      );

      for (const result of results) {
        if (result.status === "passed") {
          report.stats.passed++;
        } else if (result.status === "skipped") {
          report.stats.skipped++;
        } else if (result.status === "soft-fail") {
          report.stats.softFailed++;
        } else {
          report.stats.failed++;
          report.status = "failed";
        }
      }
    }

    // Run afterAll hooks
    if (this.testCase.hooks.afterAll) {
      const afterAllResult = await this.execute(this.testCase.hooks.afterAll);
      report.hooks.push(afterAllResult as HookResult);
    }

    return report;
  }
}

export default Run;
