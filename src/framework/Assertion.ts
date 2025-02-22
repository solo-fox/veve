/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { AssertionError } from "./AssertionError.js";
import { diff } from "./Diff.js";
import { isFn } from "./Fn.js";
import { format } from "pretty-format";
import { getOrdinal, getType } from "../utils/index.js";

/**
 * A class providing assertion methods for testing.
 */
export interface Assertion {
  /**
   * Asserts that the received value is defined (not `undefined`).
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(5).toBeDefined(); // Passes
   * assert(undefined).toBeDefined(); // Fails
   */
  toBeDefined(): Assertion | boolean;

  /**
   * Asserts that the received value is `undefined`.
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(undefined).toBeUndefined(); // Passes
   * assert(42).toBeUndefined(); // Fails
   */
  toBeUndefined(): Assertion | boolean;

  /**
   * Asserts that the received value is `null`.
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(null).toBeNull(); // Passes
   * assert(42).toBeNull(); // Fails
   */
  toBeNull(): Assertion | boolean;

  /**
   * Asserts that the received value evaluates to `true` in a boolean context.
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(1).toBeTruthy(); // Passes
   * assert(false).toBeTruthy(); // Fails
   */
  toBeTruthy(): Assertion | boolean;

  /**
   * Asserts that the received value evaluates to `false` in a boolean context.
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(false).toBeFalsy(); // Passes
   * assert(1).toBeFalsy(); // Fails
   */
  toBeFalsy(): Assertion | boolean;

  /**
   * Asserts that the received value is greater than the expected value.
   * @param {number | bigint} expected The expected value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(5).toBeGreaterThan(3); // Passes
   * assert(1).toBeGreaterThan(5); // Fails
   */
  toBeGreaterThan(expected: number | bigint): Assertion | boolean;

  /**
   * Asserts that the received value is greater than or equal to the expected value.
   * @param {number | bigint} expected The expected value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(10).toBeGreaterThanOrEqual(10); // Passes
   * assert(5).toBeGreaterThanOrEqual(10); // Fails
   */
  toBeGreaterThanOrEqual(expected: number | bigint): Assertion | boolean;

  /**
   * Asserts that the received value is less than the expected value.
   * @param {number | bigint} expected The expected value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(5).toBeLessThan(10); // Passes
   * assert(10).toBeLessThan(5); // Fails
   */
  toBeLessThan(expected: number | bigint): Assertion | boolean;

  /**
   * Asserts that the received value is an instance of the given class.
   * @param {any} expected The class to check against
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(new Date()).toBeInstanceOf(Date); // Passes
   * assert({}).toBeInstanceOf(Date); // Fails
   */
  toBeInstanceOf(expected: any): Assertion | boolean;

  /**
   * Asserts that the received value is less than or equal to the expected value.
   * @param {number | bigint} expected The expected value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(10).toBeLessThanOrEqual(10); // Passes
   * assert(15).toBeLessThanOrEqual(10); // Fails
   */
  toBeLessThanOrEqual(expected: number | bigint): Assertion | boolean;

  /**
   * Asserts that the received value is `NaN`.
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(NaN).toBeNaN(); // Passes
   * assert(5).toBeNaN(); // Fails
   */
  toBeNaN(): Assertion | boolean;

  /**
   * Asserts that the received value matches the provided pattern.
   * @param {RegExp | string} expected The expected pattern
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert("hello").toMatch(/he/); // Passes
   * assert("world").toMatch("wor"); // Passes
   */
  toMatch(expected: RegExp | string): Assertion | boolean;

  /**
   * Asserts that the received value is strictly equal to the expected value.
   * @param {any} expected The expected value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(5).toBe(5); // Passes
   * assert(5).toBe(6); // Fails
   */
  toBe(expected: any): Assertion | boolean;

  /**
   * Asserts that the received value is strictly between the min and max (exclusive).
   * @param {number | bigint} min The lower bound (exclusive)
   * @param {number | bigint} max The upper bound (exclusive)
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(15).toBeBetween(10, 20); // Passes
   * assert(15).toBeBetween(15, 20); // Fails
   */
  toBeBetween(min: number | bigint, max: number | bigint): Assertion | boolean;

  /**
   * Asserts that the received value is between the min and max (inclusive).
   * @param {number | bigint} min The lower bound (inclusive)
   * @param {number | bigint} max The upper bound (inclusive)
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(15).toBeBetweenOrEqual(10, 15); // Passes
   * assert(15).toBeBetweenOrEqual(16, 20); // Fails
   */
  toBeBetweenOrEqual(
    min: number | bigint,
    max: number | bigint,
  ): Assertion | boolean;

  /**
   * Asserts that the received value is greater than or equal to the min value.
   * @param {number | bigint} min The minimum value (inclusive)
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(15).toBeAboveMin(10); // Passes
   * assert(5).toBeAboveMin(10); // Fails
   */
  toBeAboveMin(min: number | bigint): Assertion | boolean;

  /**
   * Asserts that the received value is less than or equal to the max value.
   * @param {number | bigint} max The maximum value (inclusive)
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(15).toBeBelowMax(20); // Passes
   * assert(25).toBeBelowMax(20); // Fails
   */
  toBeBelowMax(max: number | bigint): Assertion | boolean;

  /**
   * Asserts that the received value is deeply equal to the expected value.
   * @param {any} expected The expected value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert({ a: 1, b: { c: 2 } }).toEqual({ a: 1, b: { c: 2 } }); // Passes
   * assert([1, 2, 3]).toEqual([1, 2, 3]); // Passes
   */
  toEqual(expected: any): Assertion | boolean;

  /**
   * Asserts that the received value contains the expected value.
   * @param {any} expected The expected value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert([1, 2, 3]).toContain(2); // Passes
   * assert("hello world").toContain("world"); // Passes
   */
  toContain(expected: any): Assertion | boolean;

  /**
   * Asserts that a tracked function throws an expected exception.
   * @param {any} expected The expected exception
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(() => { throw new Error("Expected error") }).toThrow("Expected error"); // Passes
   */
  toThrow(expected: any): Assertion | boolean;

  /**
   * Asserts that the number is close to another number within a specified precision.
   * @param {number} expected The expected number
   * @param {number} [numDigits=2] The number of decimal places to compare
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert(3.14159).toBeCloseTo(Math.PI, 2); // Passes
   */
  toBeCloseTo(expected: number, numDigits?: number): Assertion | boolean;

  /**
   * Asserts that the received function is tracked.
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn(() => {});
   * assert(mockFn).toBeTracked(); // Passes
   */
  toBeTracked(): Assertion | boolean;

  /**
   * Asserts that the received function has been called.
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn(() => {});
   * mockFn();
   * assert(mockFn).toHaveBeenCalled(); // Passes
   */
  toHaveBeenCalled(): Assertion | boolean;

  /**
   * Asserts that the received function has been called exactly n times.
   * @param {number} times The expected number of calls
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn(() => {});
   * mockFn();
   * mockFn();
   * assert(mockFn).toHaveBeenCalledTimes(2); // Passes
   */
  toHaveBeenCalledTimes(times: number): Assertion | boolean;

  /**
   * Asserts that the received function was called with specific arguments.
   * @param {...any} args The expected arguments
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn((a: number, b: string) => {});
   * mockFn(42, "hello");
   * assert(mockFn).toHaveBeenCalledWith(42, "hello"); // Passes
   */
  toHaveBeenCalledWith(...args: any[]): Assertion | boolean;

  /**
   * Asserts that the function was last called with specific arguments.
   * @param {...any} args The expected arguments
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn((a: number) => {});
   * mockFn(1);
   * mockFn(2);
   * assert(mockFn).toHaveBeenLastCalledWith(2); // Passes
   */
  toHaveBeenLastCalledWith(...args: any[]): Assertion | boolean;

  /**
   * Asserts that the nth call of the function was with specific arguments.
   * @param {number} n The call number to check (1-indexed)
   * @param {...any} args The expected arguments
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn((a: number) => {});
   * mockFn(1);
   * mockFn(2);
   * assert(mockFn).toHaveBeenNthCalledWith(2, 2); // Passes
   */
  toHaveBeenNthCalledWith(n: number, ...args: any[]): Assertion | boolean;

  /**
   * Asserts that the function has returned at least once.
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * assert(mockFn).toHaveReturned(); // Passes
   */
  toHaveReturned(): Assertion | boolean;

  /**
   * Asserts that the function has returned exactly n times.
   * @param {number} times The expected number of returns
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * mockFn();
   * assert(mockFn).toHaveReturnedTimes(2); // Passes
   */
  toHaveReturnedTimes(times: number): Assertion | boolean;

  /**
   * Asserts that the function has returned with a specific value.
   * @param {any} value The expected return value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * assert(mockFn).toHaveReturnedWith(42); // Passes
   */
  (value: any): Assertion | boolean;

  /**
   * Asserts that the function's last return was a specific value.
   * @param {any} value The expected return value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * mockFn();
   * assert(mockFn).toHaveLastReturnedWith(42); // Passes
   */
  toHaveLastReturnedWith(value: any): Assertion | boolean;

  /**
   * Asserts that the nth return of the function was a specific value.
   * @param {number} n The return number to check (1-indexed)
   * @param {any} value The expected return value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * const mockFn = Fn(() => 42);
   * mockFn();
   * mockFn();
   * assert(mockFn).toHaveNthReturnedWith(2, 42); // Passes
   */
  toHaveNthReturnedWith(n: number, value: any): Assertion | boolean;

  /**
   * Asserts that the received value has a specific length.
   * @param {number} length The expected length
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert([1, 2, 3]).toHaveLength(3); // Passes
   * assert("hello").toHaveLength(5); // Passes
   */
  toHaveLength(length: number): Assertion | boolean;

  /**
   * Asserts that the received object has a specific property.
   * @param {string} keyPath The dot-notation path to the property
   * @param {any} [value] The expected property value
   * @returns {Assertion | boolean} The assertion result
   * @throws {AssertionError} If the assertion fails
   *
   * @example
   * assert({ a: { b: 42 } }).toHaveProperty('a.b', 42); // Passes
   * assert({ x: 1 }).toHaveProperty('x'); // Passes
   */
  toHaveProperty(keyPath: string, value?: any): Assertion | boolean;
}

export class Assertion {
  received: any;
  isNot: boolean;
  isTracked: boolean = false;
  throws: boolean = false;

  constructor(received: any, throws: boolean) {
    this.throws = throws;
    this.received = received;
    this.isNot = false;
    this.isTracked = isFn(this.received);
  }

  get not() {
    this.isNot = !this.isNot;
    return this;
  }

  get resolves() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === "not") return target.not;
        return async (...args: any[]) => {
          try {
            const resolvedValue = await this.received;
            target.received = resolvedValue;
            return (target as any)[prop](...args);
          } catch (err: any) {
            throw new Error(
              `Expected Promise to resolve but it rejected with: ${err}`,
            );
          }
        };
      },
    });
  }

  get rejects() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === "not") return target.not;
        return async (...args: any[]) => {
          try {
            await this.received;
            throw new Error("Expected Promise to reject but it resolved.");
          } catch (err) {
            target.received = err;
            return (target as any)[prop](...args);
          }
        };
      },
    });
  }

  private assert(
    condition: boolean,
    message: string,
    matcher: string,
  ): Assertion | boolean {
    const passes = this.isNot ? !condition : condition;
    if (!passes) {
      if (this.throws) {
        throw new AssertionError(message, matcher);
      } else {
        return false;
      }
    }
    return this.throws ? this : true;
  }

  toBeDefined(): Assertion | boolean {
    return this.assert(
      this.received !== undefined,
      "Expected value to be defined",
      "toBeDefined",
    );
  }

  toBeUndefined(): Assertion | boolean {
    return this.assert(
      this.received === undefined,
      "Expected value to be undefined, but received a defined value",
      "toBeUndefined",
    );
  }

  toBeNull(): Assertion | boolean {
    return this.assert(
      this.received === null,
      "Expected value to be null, but received a non-null value",
      "toBeNull",
    );
  }

  toBeTruthy(): Assertion | boolean {
    return this.assert(
      Boolean(this.received),
      "Expected value to be truthy, but received a falsy value",
      "toBeTruthy",
    );
  }

  toBeFalsy(): Assertion | boolean {
    return this.assert(
      !this.received,
      "Expected value to be falsy",
      "toBeFalsy",
    );
  }

  toBeGreaterThan(expected: number | bigint): Assertion | boolean {
    return this.assert(
      this.received > expected,
      `Expected ${this.received} to be greater than ${expected}`,
      "toBeGreaterThan",
    );
  }

  toBeGreaterThanOrEqual(expected: number | bigint): Assertion | boolean {
    return this.assert(
      this.received >= expected,
      `Expected ${this.received} to be greater than or equal to ${expected}`,
      "toBeGreaterThanOrEqual",
    );
  }

  toBeLessThan(expected: number | bigint): Assertion | boolean {
    return this.assert(
      this.received < expected,
      `Expected ${this.received} to be less than ${expected}`,
      "toBeLessThan",
    );
  }

  toBeInstanceOf(expected: any): Assertion | boolean {
    return this.assert(
      this.received.constructor.name === expected.name,
      `Expected value to be an instance of ${expected.name}, but received ${this.received.constructor.name}`,
      "toBeInstanceOf",
    );
  }

  toBeLessThanOrEqual(expected: number | bigint): Assertion | boolean {
    return this.assert(
      this.received <= expected,
      `Expected ${this.received} to be less than or equal to ${expected}`,
      "toBeLessThanOrEqual",
    );
  }

  toBeNaN(): Assertion | boolean {
    return this.assert(
      Number.isNaN(this.received),
      "Expected value to be NaN",
      "toBeNaN",
    );
  }

  toBeBetween(min: number | bigint, max: number | bigint) {
    return this.assert(
      this.received > min && this.received < max,
      `Expected value ${this.received} to be between ${min} and ${max} (exclusive).`,
      "toBeBetween",
    );
  }

  toBeBetweenOrEqual(min: number | bigint, max: number | bigint) {
    return this.assert(
      this.received >= min && this.received <= max,
      `Expected value ${this.received} to be between ${min} and ${max} (inclusive).`,
      "toBeBetweenOrEqual",
    );
  }

  toBeAboveMin(min: number | bigint) {
    return this.assert(
      this.received >= min,
      `Expected value ${this.received} to be greater than or equal to ${min}.`,
      "toBeAboveMin",
    );
  }

  toBeBelowMax(max: number | bigint) {
    return this.assert(
      this.received <= max,
      `Expected value ${this.received} to be less than or equal to ${max}.`,
      "toBeBelowMax",
    );
  }

  toMatch(expected: RegExp | string): Assertion | boolean {
    const pass =
      getType(expected) === "regexp"
        ? // @ts-ignore
          expected.test(this.received)
        : this.received.includes(expected);
    return this.assert(
      pass,
      `Expected ${this.received} to match ${expected}`,
      "toMatch",
    );
  }

  toBe(expected: any): Assertion | boolean {
    return this.assert(
      Object.is(this.received, expected),
      diff(this.received, expected).diffFormatted,
      "toBe",
    );
  }

  toEqual(expected: any): Assertion | boolean {
    const diffs = diff(this.received, expected);

    return this.assert(
      diffs.hasDiffs === false,
      diffs.diffFormatted,
      "toEqual",
    );
  }

  toContain(expected: any): Assertion | boolean {
    const isString = typeof this.received === "string";
    const isArray = Array.isArray(this.received);

    if (!isString && !isArray) {
      return this.assert(
        false,
        `Expected value to be an array or string, but received: ${typeof this.received}`,
        "toContain",
      );
    }

    const contains = isString
      ? this.received.includes(expected)
      : isArray
        ? this.received.includes(expected)
        : false;

    return this.assert(
      contains,
      `Expected ${isString ? `"${this.received}"` : format(this.received)} to contain ${format(expected)}`,
      "toContain",
    );
  }

  toBeCloseTo(expected: number, numDigits: number = 2): Assertion | boolean {
    const multiplier = Math.pow(10, numDigits);
    const actualRounded = Math.round(this.received * multiplier);
    const expectedRounded = Math.round(expected * multiplier);

    return this.assert(
      actualRounded === expectedRounded,
      `Expected ${this.received} to be close to ${expected} within ${numDigits} decimal places`,
      "toBeCloseTo",
    );
  }

  toThrow(expected?: Error | string | RegExp): Assertion | boolean {
    // Handle case where received is not a function
    if (typeof this.received !== "function") {
      return this.assert(
        false,
        "Expected received value to be a function",
        "toThrow",
      );
    }

    let thrownError: Error | null = null;
    let didThrow = false;

    // Try to execute the function and catch any error
    try {
      this.received();
    } catch (e) {
      didThrow = true;
      thrownError =
        getType(e) === "error" ? (e as Error) : new Error(String(e));
    }

    // If no expected value provided, just check if anything was thrown
    if (expected === undefined) {
      return this.assert(
        didThrow,
        "Expected function to throw an error",
        "toThrow",
      );
    }

    // If no error was thrown but we expected one
    if (!didThrow) {
      return this.assert(
        false,
        `Expected function to throw ${expected}`,
        "toThrow",
      );
    }

    // Handle different types of expected values
    if (getType(expected) === "error") {
      // Compare Error instances
      return this.assert(
        thrownError?.constructor === expected.constructor &&
          thrownError?.message === (expected as Error).message,
        `Expected function to throw ${expected.constructor.name} with message "${(expected as Error).message}" but it threw ${thrownError?.constructor.name} with message "${thrownError?.message}"`,
        "toThrow",
      );
    }

    if (getType(expected) === "regexp") {
      // Test error message against RegExp
      return this.assert(
        (expected as RegExp).test(thrownError?.message || ""),
        `Expected error message to match ${expected} but got "${thrownError?.message}"`,
        "toThrow",
      );
    }

    if (getType(expected) === "string") {
      // Compare error message with string
      return this.assert(
        thrownError?.message === expected,
        `Expected error message to be "${expected}" but got "${thrownError?.message}"`,
        "toThrow",
      );
    }

    // Handle unexpected expected type
    return this.assert(
      false,
      `Invalid expected value type: ${getType(expected)}. Must be Error, string, or RegExp`,
      "toThrow",
    );
  }

  toBeTracked(): Assertion | boolean {
    return this.assert(
      this.isTracked,
      "Expected function to be tracked",
      "toBeTracked",
    );
  }

  toHaveBeenCalled(): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenCalled can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received.wasCalled(),
      "Expected function to have been called",
      "toHaveBeenCalled",
    );
  }

  toHaveBeenCalledTimes(times: number): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenCalledTimes can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received.wasCalledTimes(times),
      `Expected function to have been called ${times} times, but was called ${this.received.getCallCount()} times`,
      "toHaveBeenCalledTimes",
    );
  }

  toHaveBeenCalledWith(...args: any[]): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenCalledWith can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received.wasCalledWith(...args),
      `Expected function to have been called with ${format(args)}.`,
      "toHaveBeenCalledWith",
    );
  }

  toHaveBeenLastCalledWith(...args: any[]): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenLastCalledWith can only be used with tracked functions",
      );
    }
    const latestCall = this.received.getLatestCall();
    const diffs = diff(latestCall.args, args);
    return this.assert(
      latestCall && diffs.hasDiffs === false,
      `Function's last call differences: \n\n${diffs.diffFormatted}`,
      "toHaveBeenLastCalledWith",
    );
  }

  toHaveBeenNthCalledWith(n: number, ...args: any[]): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveBeenNthCalledWith can only be used with tracked functions",
      );
    }
    const call = this.received.getCall(n - 1);
    const diffs = diff(call.args, args);
    return this.assert(
      call && diffs.hasDiffs === false,
      `Function's ${n}${getOrdinal(n)} call differences: \n\n${diffs.diffFormatted}`,
      "toHaveBeenNthCalledWith",
    );
  }

  toHaveReturned(): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error("toHaveReturned can only be used with tracked functions");
    }
    return this.assert(
      this.received.getReturnValues().length > 0,
      "Expected function to have returned",
      "toHaveReturned",
    );
  }

  toHaveReturnedTimes(times: number): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveReturnedTimes can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received.getReturnValues().length === times,
      `Expected function to have returned ${times} times, but returned ${this.received.getReturnValues().length} times`,
      "toHaveReturnedTimes",
    );
  }

  toHaveReturnedWith(value: any): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveReturnedWith can only be used with tracked functions",
      );
    }
    return this.assert(
      this.received
        .getReturnValues()
        .some((rv: any) => diff(rv, value).hasDiffs),
      `Expected function to have returned with ${format(value)}`,
      "toHaveReturnedWith",
    );
  }

  toHaveLastReturnedWith(value: any): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveLastReturnedWith can only be used with tracked functions",
      );
    }
    const returnValues = this.received.getReturnValues();
    const diffs = diff(returnValues[returnValues.length - 1], value);
    return this.assert(
      returnValues.length > 0 && diffs.hasDiffs === false,
      `Function's last return differences: \n\n${diffs.diffFormatted}`,
      "toHaveLastReturnedWith",
    );
  }

  toHaveNthReturnedWith(n: number, value: any): Assertion | boolean {
    if (!this.isTracked) {
      throw new Error(
        "toHaveNthReturnedWith can only be used with tracked functions",
      );
    }
    const returnValues = this.received.getReturnValues();
    const diffs = diff(returnValues[n - 1], value);
    return this.assert(
      returnValues.length >= n && diffs.hasDiffs === false,
      `Function's ${n}${getOrdinal(n)} return differences: \n\n ${diffs.diffFormatted}`,
      "toHaveNthReturnedWith",
    );
  }

  toHaveLength(length: number): Assertion | boolean {
    return this.assert(
      this.received.length === length,
      `Expected length to be ${length}, but got ${this.received.length}`,
      "toHaveLength",
    );
  }

  toHaveProperty(keyPath: string, value?: any): Assertion | boolean {
    const keys = keyPath.split(".");
    let obj = this.received;

    for (const key of keys) {
      if (obj === null || typeof obj !== "object" || !(key in obj)) {
        return this.assert(
          false,
          `Property ${keyPath} not found`,
          "toHaveProperty",
        );
      }
      obj = obj[key];
    }

    if (arguments.length > 1) {
      const diffs = diff(obj, value);
      return this.assert(
        diffs.hasDiffs === false,
        `Property ${keyPath} does not have expected value`,
        "toHaveProperty",
      );
    }

    return this.assert(true, "", "toHaveProperty");
  }
}

/**
 * Creates a new assertion instance for the provided value.
 * - This function performs assertions that will **throw an error** if the condition fails.
 * - Use this when you need hard failure handling for invalid conditions.
 *
 * @param {any} received - The value to be asserted.
 * @example
 * assert(42).toBe(42); // Passes
 * assert("hello").toBe("world"); // Throws an error
 * @returns {Assertion} An `Assertion` instance configured to throw errors on failure.
 */
export function assert(received: any): Assertion {
  return new Assertion(received, true);
}

/**
 * Creates a new assertion instance for the provided value.
 * - This function performs non-throwing assertions, which do not raise errors on failure.
 * - Use this for scenarios where you want to test conditions without interrupting execution.
 *
 * @param {any} received - The value to be strictly asserted.
 * @example
 * is(42).toBe(42); // Passes
 * is("hello").toBe("world"); // Does not throw, but marks failure
 * @returns {Assertion} An `Assertion` instance configured to silently handle failures.
 */
export function is(received: any): Assertion {
  return new Assertion(received, false);
}
