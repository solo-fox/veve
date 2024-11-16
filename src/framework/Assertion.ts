import diff from "deep-diff";

// More specific type definitions
type DiffKind = "N" | "D" | "E" | "A";
type Path = (string | number)[];

interface BasicDiff<T> {
  kind: "N" | "D" | "E";
  path?: Path;
  lhs?: T;
  rhs?: T;
}

interface ArrayDiff<T> {
  kind: "A";
  path?: Path;
  index: number;
  item: BasicDiff<T>;
}

type Diff<T> = BasicDiff<T> | ArrayDiff<T>;

// Maximum depth for recursive operations
const MAX_DEPTH = 100;

class CircularReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircularReferenceError";
  }
}

class MaxDepthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaxDepthError";
  }
}

function getType(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  const typeOfValue = typeof value;
  if (typeOfValue !== "object") return typeOfValue;

  if (value instanceof RegExp) return "regexp";
  if (value instanceof Map) return "map";
  if (value instanceof Set) return "set";
  if (value instanceof Date) return "date";

  return "object";
}

function isPrimitive(value: unknown): boolean {
  return (
    value === null || // `null` is a primitive
    value === undefined || // `undefined` is a primitive
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  );
}

function createPathString(path: Path): string {
  return path
    .map((segment) =>
      typeof segment === "number"
        ? `[${segment}]`
        : /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(segment))
          ? segment
          : `["${segment}"]`,
    )
    .join("");
}

function detectCircular(obj: unknown, seen = new WeakSet()): boolean {
  if (typeof obj !== "object" || obj === null) return false;

  if (seen.has(obj)) return true;
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.some((item) => detectCircular(item, seen));
  }

  return Object.values(obj).some((value) => detectCircular(value, seen));
}

function deepEqual(value1: any, value2: any, cache = new WeakMap()): boolean {
  // Check if both values are strictly equal (handles primitives and identical references)
  if (value1 === value2) return true;

  // Check if either is null or not an object (at this point we know they're not strictly equal)
  if (
    value1 === null ||
    value2 === null ||
    typeof value1 !== "object" ||
    typeof value2 !== "object"
  ) {
    return false;
  }

  // Use cache to avoid redundant comparisons
  if (cache.has(value1) && cache.get(value1) === value2) return true;
  cache.set(value1, value2);

  // Check if both are arrays
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) return false; // Different lengths
    // Compare each element
    return value1.every((item, index) => deepEqual(item, value2[index], cache));
  }

  // Check if both are plain objects
  if (!Array.isArray(value1) && !Array.isArray(value2)) {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);

    if (keys1.length !== keys2.length) return false; // Different number of keys

    // Compare each key-value pair
    return keys1.every((key) => deepEqual(value1[key], value2[key], cache));
  }

  // If one is an array and the other is not, they are not equal
  return false;
}

// Function to pretty format any value, handling types like Map, Set, Date, RegExp, etc.
function prettyFormat(
  value: unknown,
  depth: number = 0,
  space: string = "\t",
  seen: WeakSet<object> = new WeakSet()
): string {
  // Prevent circular references by checking if the value has been seen
  if (typeof value === 'object' && value !== null) {
    if (seen.has(value)) {
      return '[Circular]'; // Handle circular reference here
    }
    seen.add(value);
  }

  // Handle primitive values directly
  if (isPrimitive(value)) {
    return String(value);
  }

  const type = getType(value);

  // Handle Date objects
  if (type === "date") {
    return `Date("${(value as Date).toISOString()}")`;
  }

  // Handle Set
  if (type === "set") {
    const setValue = value as Set<unknown>;
    if (setValue.size === 0) return 'Set {}';
    let result = 'Set {\n';
    for (const item of setValue) {
      result += `${space.repeat(depth + 1)}${prettyFormat(item, depth + 1 , space, seen)}\n`;
    }
    result += `${space.repeat(depth)}}`;
    return result;
  }

  // Handle Map
  if (type === "map") {
    const mapValue = value as Map<unknown, unknown>;
    if (mapValue.size === 0) return 'Map {}';
    let result = 'Map {\n';
    for (const [key, val] of mapValue) {
      result += `${space.repeat(depth + 1)}[${prettyFormat(key, depth + 1 , space, seen)}]: ${prettyFormat(val, depth + 1 , space, seen)}\n`;
    }
    result += `${space.repeat(depth)}}`;
    return result;
  }

  // Handle RegExp
  if (type === "regexp") {
    return `RegExp("${(value as RegExp).source}", "${(value as RegExp).flags}")`;
  }

  // Handle Arrays
  if (type === "array") {
    const arrayValue = value as unknown[];
    if (arrayValue.length === 0) return 'Array []';
    let result = 'Array [\n';
    for (let i = 0; i < arrayValue.length; i++) {
      result += `${space.repeat(depth + 1)}${prettyFormat(arrayValue[i], depth + 1 , space, seen)}`;
      if (i < arrayValue.length - 1) {
        result += ',';
      }
      result += '\n';
    }
    result += `${space.repeat(depth)}]`;
    return result;
  }

  // Handle Objects (plain objects or arrays)
  if (type === "object") {
    const objectValue = value as Record<string, unknown>;
    let result = 'Object {\n';
    const keys = Object.keys(objectValue);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      result += `${space.repeat(depth + 1)}"${key}": ${prettyFormat(objectValue[key], depth + 1, space, seen)}`;
      if (i < keys.length - 1) {
        result += ',';
      }
      result += '\n';
    }
    result += `${space.repeat(depth)}}`;
    return result;
  }

  // Default to string representation for unsupported types
  return String(value);
}

function diffObject(
  expected: Record<string, unknown>,
  received: Record<string, unknown>,
  differences: Array<Diff<unknown>>,
  parentPath: Path = [],
  depth = 0,
): string {
  if (depth > MAX_DEPTH) {
    throw new MaxDepthError(`Maximum diff depth of ${MAX_DEPTH} exceeded`);
  }

  let output = "Object {\n";
  const indent = "  ".repeat(depth + 1);

  const keys = [
    ...new Set([...Object.keys(expected), ...Object.keys(received)]),
  ];

  for (const key of keys) {
    const path = [...parentPath, key];
    const pathStr = createPathString(path);

    const expectedValue = expected[key];
    const receivedValue = received[key];

    // Get all diffs for the current path
    const diffsToPath = differences.filter(
      (diff) =>
        diff.path?.length === path.length &&
        diff.path.every((segment, i) => segment === path[i]),
    );

    if (diffsToPath.length > 0) {
      const currentDiff = diffsToPath[0];

      switch (currentDiff.kind) {
        case "N": // New key
          output += `${indent}+ ${pathStr}: ${prettyFormat(currentDiff.rhs, depth)}\n`;
          break;
        case "D": // Deleted key
          output += `${indent}- ${pathStr}: ${
            prettyFormat(currentDiff.lhs, depth)}\n`;
          break;
        case "E": // Edited key
          const nestedDiff = formatDiff(
            currentDiff.lhs,
            currentDiff.rhs,
            depth + 1,
          );
          if (nestedDiff) {
            output += `${indent}${pathStr}: ${nestedDiff}\n`;
          }
          break;
        case "A": // Array modification
          if (Array.isArray(expectedValue) && Array.isArray(receivedValue)) {
            const arrayDiff = diffArray(
              expectedValue,
              receivedValue,
              differences,
              path,
              depth + 1,
            );
            output += `${indent}${pathStr}: ${arrayDiff}\n`;
          }
          break;
      }
    } else {
      // Handle cases where no direct diff exists (e.g., nested objects/arrays)
      if (deepEqual(expectedValue, receivedValue)) {
        // Use deepEqual here
        output += `${indent}${pathStr}: ${prettyFormat(expectedValue, depth + 1)}\n`;
      } else if (
        isPrimitive(expectedValue) &&
        isPrimitive(receivedValue) &&
        expectedValue !== receivedValue
      ) {
        // Handle primitive differences
        output += `${indent}- ${pathStr}: ${prettyFormat(expectedValue, depth)}\n`;
        output += `${indent}+ ${pathStr}: ${prettyFormat(receivedValue, depth)}\n`;
      } else if (!isPrimitive(expectedValue) && !isPrimitive(receivedValue)) {
        // Optionally include unchanged values
        const nestedDiff = formatDiff(expectedValue, receivedValue, depth + 1);
        if (nestedDiff) {
          output += `${indent}${pathStr}: ${nestedDiff}\n`;
        }
      }
    }
  }

  output += `${"  ".repeat(depth)}}`;
  return output;
}

function diffArray(
  expected: unknown[],
  received: unknown[],
  differences: Array<Diff<unknown>>,
  parentPath: Path = [],
  depth = 0,
): string {
  if (depth > MAX_DEPTH) {
    throw new MaxDepthError(`Maximum diff depth of ${MAX_DEPTH} exceeded`);
  }

  let output = "Array [\n";
  const indent = "  ".repeat(depth + 1);

  const maxLength = Math.max(expected.length, received.length);

  for (let i = 0; i < maxLength; i++) {
    const path = [...parentPath, i];
    const pathStr = `[${i}]`;
    const expectedValue = expected[i];
    const receivedValue = received[i];

    const diffsToPath = differences.filter((diff) => {
      if (diff.kind === "A" && diff.index === i) return true;
      return (
        diff.path?.length === path.length &&
        diff.path.every((segment, j) => segment === path[j])
      );
    });

    if (diffsToPath.length > 0) {
      const currentDiff = diffsToPath[0];

      // Handle array diffs (kind: "A")
      if (currentDiff.kind === "A") {
        const item = currentDiff.item;
        switch (item.kind) {
          case "N":
            output += `${indent}+ ${pathStr}: ${prettyFormat(item.rhs,depth)}\n`;
            break;
          case "D":
            output += `${indent}- ${pathStr}: ${prettyFormat(item.lhs,depth)}\n`;
            break;
          case "E":
            const nestedDiff = formatDiff(item.lhs, item.rhs, depth + 1);
            if (nestedDiff) {
              output += `${indent}${pathStr}: ${nestedDiff}\n`;
            } else {
              output += `${indent}- ${pathStr}: ${prettyFormat(item.lhs,depth)}\n`;
              output += `${indent}+ ${pathStr}: ${prettyFormat(item.rhs,depth)}\n`;
            }
            break;
        }
      } else {
        // Handle direct array element changes (kind: "N", "D", "E")
        switch (currentDiff.kind) {
          case "N":
            output += `${indent}+ ${pathStr}: ${prettyFormat(currentDiff.rhs,depth)}\n`;
            break;
          case "D":
            output += `${indent}- ${pathStr}: ${prettyFormat(currentDiff.lhs,depth)}\n`;
            break;
          case "E":
            const nestedDiff = formatDiff(
              currentDiff.lhs,
              currentDiff.rhs,
              depth + 1,
            );
            if (nestedDiff) {
              output += `${indent}${pathStr}: ${nestedDiff}\n`;
            } else {
              output += `${indent}- ${pathStr}: ${prettyFormat(currentDiff.lhs,depth)}\n`;
              output += `${indent}+ ${pathStr}: ${prettyFormat(currentDiff.rhs,depth)}\n`;
            }
            break;
        }
      }
    } else if (i < expected.length && i < received.length) {
      // No diff detected, compare nested structures or show values
      if (deepEqual(expectedValue, receivedValue)) {
        // Use deepEqual here
        output += `${indent}${pathStr}: ${prettyFormat(expectedValue,depth)}\n`;
      } else {
        const nestedDiff = formatDiff(expectedValue, receivedValue, depth + 1);
        if (nestedDiff) {
          output += `${indent}${pathStr}: ${nestedDiff}\n`;
        } else {
          output += `${indent}- ${pathStr}: ${prettyFormat(expectedValue,depth)}\n`;
          output += `${indent}+ ${pathStr}: ${prettyFormat(receivedValue,depth)}\n`;
        }
      }
    } else if (i >= expected.length) {
      // Handle added elements in the `received` array
      output += `${indent}+ ${pathStr}: ${prettyFormat(receivedValue,depth)}\n`;
    } else {
      // Handle removed elements from the `expected` array
      output += `${indent}- ${pathStr}: ${prettyFormat(expectedValue,depth)}\n`;
    }
  }

  output += `${"  ".repeat(depth)}]`;
  return output;
}

function diffPrimitive(
  expected: unknown,
  received: unknown,
): string | undefined {
  const expectedStr = String(expected);
  const receivedStr = String(received);

  if (expectedStr !== receivedStr) {
    return `-${prettyFormat(expectedStr)} +${prettyFormat(receivedStr)}`;
  }
  return undefined;
}

function formatDiff(
  expected: unknown,
  received: unknown,
  depth = 0,
): string | undefined {
  // Check for circular references
  if (detectCircular(expected) || detectCircular(received)) {
    throw new CircularReferenceError("Circular reference detected in input");
  }

  const differences = diff(expected, received);
  if (!differences) return undefined;

  const expectedType = getType(expected);
  const receivedType = getType(received);

  // If types are different, show the complete change
  if (expectedType !== receivedType) {
    return `- ${prettyFormat(expected,depth)}\n+ ${prettyFormat(received,depth)}`;
  }

  try {
    switch (expectedType) {
      case "object":
        return diffObject(
          expected as Record<string, unknown>,
          received as Record<string, unknown>,
          differences,
          [],
          depth,
        );
      case "array":
        return diffArray(
          expected as unknown[],
          received as unknown[],
          differences,
          [],
          depth,
        );
      case "map":
        return diffObject(
          Object.fromEntries(expected as Map<unknown, unknown>),
          Object.fromEntries(received as Map<unknown, unknown>),
          differences,
          [],
          depth,
        );
      case "set":
        return diffArray(
          Array.from(expected as Set<unknown>),
          Array.from(received as Set<unknown>),
          differences,
          [],
          depth,
        );
      case "date":
        return diffPrimitive(
          (expected as Date).toISOString(),
          (received as Date).toISOString(),
        );
      default:
        return diffPrimitive(expected, received);
    }
  } catch (error: any) {
    if (
      error instanceof MaxDepthError ||
      error instanceof CircularReferenceError
    ) {
      throw error;
    }
    throw new Error(`Error comparing values: ${error.message}`);
  }
}

function toBe(expected: any) {
  return function (received: any) {
    const diffrences = formatDiff(expected, received);
    if (diffrences) throw new Error(diffrences);
  };
}

export function expect(expectation: any) {
  return {
    toBe: toBe(expectation),
  };
}
