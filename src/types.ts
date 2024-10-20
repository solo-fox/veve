/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
export type TestFile = {
  path: string;
};

export type TestResult = {
  description: string;
  passed: boolean;
  error?: { message: string, stack: string};
};

export type HookResult = {
  type: "beforeAll" | "beforeEach";
  passed: boolean;
  error? : { message: string, stack: string};
};

export type SuiteReport = {
  passed: boolean;
  description: string;
  passedTests: number;
  failedTests: number;
  tests: Array<TestResult>;
  hooks: Array<HookResult>;
  children: SuiteReport[];
  error?: string;
};

export type TestConfig = {
  testDirectory: string;
  filePattern: string | string[];
  exclude: string | string[];
  //reporters
  reporters: ("html" | "json" | "spec" | "md" | "xml" | "csv")[];
  outputDir: string;

  useColors: boolean;
};

export type StetsConfig = Partial<TestConfig>;
